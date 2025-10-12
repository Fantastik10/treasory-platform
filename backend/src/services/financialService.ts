import { prisma } from '../config/database';

export class FinancialService {
  static async getGlobalBalance(bureauId: string) {
    const accounts = await prisma.account.findMany({
      where: { 
        bureauId,
        isActive: true 
      }
    });

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    const balanceByType = accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = 0;
      }
      acc[account.type] += account.balance;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBalance,
      balanceByType,
      accountCount: accounts.length
    };
  }

  static async getFinancialOverview(bureauId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Solde global
    const globalBalance = await this.getGlobalBalance(bureauId);

    // Résumé du mois en cours
    const currentMonthSummary = await prisma.transaction.aggregate({
      where: {
        bureauId,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lte: new Date(currentYear, currentMonth, 0, 23, 59, 59)
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Résumé du mois précédent
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const lastMonthSummary = await prisma.transaction.aggregate({
      where: {
        bureauId,
        date: {
          gte: new Date(lastMonthYear, lastMonth - 1, 1),
          lte: new Date(lastMonthYear, lastMonth, 0, 23, 59, 59)
        }
      },
      _sum: {
        amount: true
      }
    });

    // Dernières transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { bureauId },
      include: {
        account: {
          select: {
            name: true,
            type: true
          }
        },
        createdBy: {
          select: {
            email: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 10
    });

    // Évolution mensuelle (6 derniers mois)
    const monthlyEvolution = await this.getMonthlyEvolution(bureauId, 6);

    return {
      globalBalance,
      currentMonth: {
        income: currentMonthSummary._sum.amount || 0,
        transactionCount: currentMonthSummary._count.id
      },
      lastMonth: {
        income: lastMonthSummary._sum.amount || 0
      },
      recentTransactions,
      monthlyEvolution
    };
  }

  static async getMonthlyEvolution(bureauId: string, months: number = 6) {
    const result = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const period = `${year}-${month.toString().padStart(2, '0')}`;

      const stats = await prisma.financialStats.findUnique({
        where: {
          bureauId_period: {
            bureauId,
            period
          }
        }
      });

      result.push({
        period,
        year,
        month,
        totalIncome: stats?.totalIncome || 0,
        totalExpense: stats?.totalExpense || 0,
        netFlow: stats?.netFlow || 0
      });
    }

    return result;
  }

  static async getYearlySummary(bureauId: string, year: number) {
    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const period = `${year}-${month.toString().padStart(2, '0')}`;
      
      const stats = await prisma.financialStats.findUnique({
        where: {
          bureauId_period: {
            bureauId,
            period
          }
        }
      });

      monthlyData.push({
        month,
        period,
        totalIncome: stats?.totalIncome || 0,
        totalExpense: stats?.totalExpense || 0,
        netFlow: stats?.netFlow || 0
      });
    }

    const annualTotals = monthlyData.reduce(
      (acc, month) => ({
        totalIncome: acc.totalIncome + month.totalIncome,
        totalExpense: acc.totalExpense + month.totalExpense,
        netFlow: acc.netFlow + month.netFlow
      }),
      { totalIncome: 0, totalExpense: 0, netFlow: 0 }
    );

    return {
      monthlyData,
      annualTotals,
      year
    };
  }
}