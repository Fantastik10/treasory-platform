import { prisma } from '../config/database';

export interface CreateAccountData {
  name: string;
  type: string;
  balance: number;
  currency: string;
  bureauId: string;
}

export interface UpdateAccountData {
  name?: string;
  balance?: number;
  currency?: string;
  isActive?: boolean;
}

export class AccountService {
  static async createAccount(data: CreateAccountData) {
    return await prisma.account.create({
      data: {
        name: data.name,
        type: data.type as any,
        balance: data.balance,
        currency: data.currency,
        bureauId: data.bureauId
      },
      include: {
        bureau: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });
  }

  static async getAccountById(accountId: string) {
    return await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        bureau: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        transactions: {
          orderBy: { date: 'desc' },
          take: 50,
          include: {
            createdBy: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  static async getAccountsByBureau(bureauId: string) {
    return await prisma.account.findMany({
      where: { bureauId },
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: { type: 'asc' }
    });
  }

  static async updateAccount(accountId: string, data: UpdateAccountData) {
    return await prisma.account.update({
      where: { id: accountId },
      data,
      include: {
        bureau: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
  }

  static async updateAccountBalance(accountId: string, newBalance: number) {
    return await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
      include: {
        bureau: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
  }

  static async deleteAccount(accountId: string) {
    // Vérifier s'il y a des transactions associées
    const transactionsCount = await prisma.transaction.count({
      where: { accountId }
    });

    if (transactionsCount > 0) {
      throw new Error('Impossible de supprimer un compte avec des transactions');
    }

    return await prisma.account.delete({
      where: { id: accountId }
    });
  }

  static async getAccountsSummary(bureauId: string) {
    const accounts = await this.getAccountsByBureau(bureauId);
    
    const summary = {
      totalBalance: 0,
      byType: {} as Record<string, { count: number; balance: number }>,
      accounts: accounts
    };

    accounts.forEach(account => {
      summary.totalBalance += account.balance;
      
      if (!summary.byType[account.type]) {
        summary.byType[account.type] = { count: 0, balance: 0 };
      }
      
      summary.byType[account.type].count++;
      summary.byType[account.type].balance += account.balance;
    });

    return summary;
  }
}