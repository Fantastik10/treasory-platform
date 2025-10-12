import { prisma } from '../config/database';

export interface CreateTransactionData {
  amount: number;
  type: string;
  description: string;
  category?: string;
  date: Date;
  accountId: string;
  bureauId: string;
  createdById: string;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  category?: string;
  accountId?: string;
}

export class TransactionService {
  static async createTransaction(data: CreateTransactionData) {
    // Commencer une transaction pour mettre à jour le solde du compte
    const result = await prisma.$transaction(async (tx) => {
      // Créer la transaction
      const transaction = await tx.transaction.create({
        data: {
          amount: data.amount,
          type: data.type as any,
          description: data.description,
          category: data.category,
          date: data.date,
          accountId: data.accountId,
          bureauId: data.bureauId,
          createdById: data.createdById
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          createdBy: {
            select: {
              id: true,
              email: true
            }
          },
          bureau: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Mettre à jour le solde du compte
      const account = await tx.account.findUnique({
        where: { id: data.accountId }
      });

      if (!account) {
        throw new Error('Compte non trouvé');
      }

      const newBalance = data.type === 'ENTREE' 
        ? account.balance + data.amount
        : account.balance - data.amount;

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance }
      });

      // Mettre à jour les statistiques
      await this.updateFinancialStats(data.bureauId, data.date);

      return transaction;
    });

    return result;
  }

  static async getTransactionById(transactionId: string) {
    return await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true
          }
        },
        bureau: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  static async getTransactionsByBureau(
    bureauId: string, 
    filters: TransactionFilters = {},
    page: number = 1, 
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;

    const where: any = { bureauId };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.accountId) {
      where.accountId = filters.accountId;
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          createdBy: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);

    return {
      transactions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  static async getTransactionsByAccount(
    accountId: string, 
    page: number = 1, 
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: { accountId },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          createdBy: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({
        where: { accountId }
      })
    ]);

    return {
      transactions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  static async deleteTransaction(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new Error('Transaction non trouvée');
    }

    // Vérifier les permissions (seul l'auteur ou un admin peut supprimer)
    if (transaction.createdById !== userId) {
      // Vérifier le rôle de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user?.role.startsWith('ADMIN')) {
        throw new Error('Vous ne pouvez supprimer que vos propres transactions');
      }
    }

    return await prisma.$transaction(async (tx) => {
      // Supprimer la transaction
      const deletedTransaction = await tx.transaction.delete({
        where: { id: transactionId }
      });

      // Recalculer le solde du compte
      const accountTransactions = await tx.transaction.findMany({
        where: { accountId: transaction.accountId },
        orderBy: { date: 'asc' }
      });

      let balance = 0;
      accountTransactions.forEach(t => {
        balance = t.type === 'ENTREE' ? balance + t.amount : balance - t.amount;
      });

      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance }
      });

      // Mettre à jour les statistiques
      await this.updateFinancialStats(transaction.bureauId, transaction.date);

      return deletedTransaction;
    });
  }

  static async updateFinancialStats(bureauId: string, date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const period = `${year}-${month.toString().padStart(2, '0')}`;

    // Calculer les totaux pour la période
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        bureauId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const totalIncome = transactions
      .filter(t => t.type === 'ENTREE')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'SORTIE')
      .reduce((sum, t) => sum + t.amount, 0);

    const netFlow = totalIncome - totalExpense;

    // Mettre à jour ou créer les stats
    await prisma.financialStats.upsert({
      where: {
        bureauId_period: {
          bureauId,
          period
        }
      },
      update: {
        totalIncome,
        totalExpense,
        netFlow
      },
      create: {
        bureauId,
        period,
        totalIncome,
        totalExpense,
        netFlow,
        startBalance: 0, // À calculer basé sur le mois précédent
        endBalance: 0    // À calculer
      }
    });
  }

  static async getMonthlySummary(bureauId: string, year: number, month?: number) {
    const where: any = { bureauId };
    
    if (month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    } else {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            type: true
          }
        }
      }
    });

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      netFlow: 0,
      byCategory: {} as Record<string, number>,
      byAccountType: {} as Record<string, { income: number; expense: number }>
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'ENTREE') {
        summary.totalIncome += transaction.amount;
        
        // Par catégorie
        const category = transaction.category || 'Non catégorisé';
        summary.byCategory[category] = (summary.byCategory[category] || 0) + transaction.amount;
        
        // Par type de compte
        const accountType = transaction.account.type;
        if (!summary.byAccountType[accountType]) {
          summary.byAccountType[accountType] = { income: 0, expense: 0 };
        }
        summary.byAccountType[accountType].income += transaction.amount;
      } else {
        summary.totalExpense += transaction.amount;
        
        // Par catégorie
        const category = transaction.category || 'Non catégorisé';
        summary.byCategory[category] = (summary.byCategory[category] || 0) - transaction.amount;
        
        // Par type de compte
        const accountType = transaction.account.type;
        if (!summary.byAccountType[accountType]) {
          summary.byAccountType[accountType] = { income: 0, expense: 0 };
        }
        summary.byAccountType[accountType].expense += transaction.amount;
      }
    });

    summary.netFlow = summary.totalIncome - summary.totalExpense;

    return summary;
  }
}