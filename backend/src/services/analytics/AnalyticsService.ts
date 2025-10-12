import { prisma } from '../../config/database';

export interface DashboardStats {
  global: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    netFlow: number;
    transactionCount: number;
  };
  accounts: {
    byType: Array<{
      type: string;
      count: number;
      balance: number;
      percentage: number;
    }>;
    recentActivity: Array<{
      id: string;
      name: string;
      type: string;
      lastTransaction: string;
      transactionCount: number;
    }>;
  };
  trends: {
    monthlyEvolution: Array<{
      period: string;
      income: number;
      expense: number;
      netFlow: number;
    }>;
    growthRates: {
      income: number;
      expense: number;
      balance: number;
    };
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export class AnalyticsService {
  static async getDashboardStats(bureauId: string): Promise<DashboardStats> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Récupérer les données en parallèle
    const [
      accounts,
      monthlyTransactions,
      totalTransactions,
      monthlyEvolution
    ] = await Promise.all([
      // Comptes et soldes
      prisma.account.findMany({
        where: { bureauId, isActive: true },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
            take: 1
          },
          _count: {
            select: { transactions: true }
          }
        }
      }),

      // Transactions du mois
      prisma.transaction.findMany({
        where: {
          bureauId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),

      // Total des transactions
      prisma.transaction.count({
        where: { bureauId }
      }),

      // Évolution mensuelle (6 derniers mois)
      this.getMonthlyEvolution(bureauId, 6)
    ]);

    // Calculer les totaux
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'ENTREE')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === 'SORTIE')
      .reduce((sum, t) => sum + t.amount, 0);

    const netFlow = monthlyIncome - monthlyExpense;

    // Statistiques par type de compte
    const accountsByType = accounts.reduce((acc, account) => {
      const type = account.type;
      if (!acc[type]) {
        acc[type] = { count: 0, balance: 0 };
      }
      acc[type].count++;
      acc[type].balance += account.balance;
      return acc;
    }, {} as Record<string, { count: number; balance: number }>);

    const accountsByTypeArray = Object.entries(accountsByType).map(([type, data]) => ({
      type,
      count: data.count,
      balance: data.balance,
      percentage: totalBalance > 0 ? (data.balance / totalBalance) * 100 : 0
    }));

    // Activité récente des comptes
    const recentActivity = accounts
      .map(account => ({
        id: account.id,
        name: account.name,
        type: account.type,
        lastTransaction: account.transactions[0]?.date.toISOString() || account.createdAt.toISOString(),
        transactionCount: account._count.transactions
      }))
      .sort((a, b) => new Date(b.lastTransaction).getTime() - new Date(a.lastTransaction).getTime())
      .slice(0, 5);

    // Taux de croissance (comparaison avec le mois précédent)
    const previousMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPreviousMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const previousMonthTransactions = await prisma.transaction.findMany({
      where: {
        bureauId,
        date: {
          gte: previousMonth,
          lte: endOfPreviousMonth
        }
      }
    });

    const previousMonthIncome = previousMonthTransactions
      .filter(t => t.type === 'ENTREE')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousMonthExpense = previousMonthTransactions
      .filter(t => t.type === 'SORTIE')
      .reduce((sum, t) => sum + t.amount, 0);

    const growthRates = {
      income: previousMonthIncome > 0 ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100 : 0,
      expense: previousMonthExpense > 0 ? ((monthlyExpense - previousMonthExpense) / previousMonthExpense) * 100 : 0,
      balance: 0 // À calculer basé sur l'historique
    };

    return {
      global: {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        netFlow,
        transactionCount: totalTransactions
      },
      accounts: {
        byType: accountsByTypeArray,
        recentActivity
      },
      trends: {
        monthlyEvolution,
        growthRates
      }
    };
  }

  static async getMonthlyEvolution(bureauId: string, months: number = 6): Promise<any[]> {
    const result = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const period = `${year}-${month.toString().padStart(2, '0')}`;

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

      const income = transactions
        .filter(t => t.type === 'ENTREE')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter(t => t.type === 'SORTIE')
        .reduce((sum, t) => sum + t.amount, 0);

      const netFlow = income - expense;

      result.push({
        period,
        year,
        month,
        income,
        expense,
        netFlow
      });
    }

    return result;
  }

  static async getIncomeExpenseChartData(bureauId: string, year?: number): Promise<ChartData> {
    const targetYear = year || new Date().getFullYear();
    const monthlyData = await this.getMonthlyEvolution(bureauId, 12);
    
    const yearData = monthlyData.filter(data => data.year === targetYear);

    return {
      labels: yearData.map(data => {
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return monthNames[data.month - 1];
      }),
      datasets: [
        {
          label: 'Entrées',
          data: yearData.map(data => data.income),
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          borderWidth: 2
        },
        {
          label: 'Sorties',
          data: yearData.map(data => data.expense),
          backgroundColor: '#ef4444',
          borderColor: '#ef4444',
          borderWidth: 2
        }
      ]
    };
  }

  static async getAccountDistributionChartData(bureauId: string): Promise<ChartData> {
    const accounts = await prisma.account.findMany({
      where: { bureauId, isActive: true }
    });

    const accountsByType = accounts.reduce((acc, account) => {
      const type = this.getAccountTypeDisplayName(account.type);
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += account.balance;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      'Banque': '#3b82f6',
      'PayPal': '#0070ba',
      'Caisse': '#10b981',
      'Mobile Money': '#8b5cf6',
      'Autre': '#6b7280'
    };

    return {
      labels: Object.keys(accountsByType),
      datasets: [
        {
          label: 'Répartition par type',
          data: Object.values(accountsByType),
          backgroundColor: Object.keys(accountsByType).map(type => colors[type as keyof typeof colors] || '#6b7280'),
          borderWidth: 1
        }
      ]
    };
  }

  static async getCategoryChartData(bureauId: string, months: number = 6): Promise<ChartData> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        bureauId,
        date: {
          gte: startDate
        },
        category: {
          not: null
        }
      }
    });

    const categories = transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Non catégorisé';
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'ENTREE') {
        acc[category].income += transaction.amount;
      } else {
        acc[category].expense += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    // Trier par montant total et prendre le top 8
    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => (b.income + b.expense) - (a.income + a.expense))
      .slice(0, 8);

    return {
      labels: sortedCategories.map(([category]) => category),
      datasets: [
        {
          label: 'Entrées',
          data: sortedCategories.map(([, data]) => data.income),
          backgroundColor: '#10b981'
        },
        {
          label: 'Sorties',
          data: sortedCategories.map(([, data]) => data.expense),
          backgroundColor: '#ef4444'
        }
      ]
    };
  }

  static async getCashFlowForecast(bureauId: string, months: number = 3): Promise<ChartData> {
    const historicalData = await this.getMonthlyEvolution(bureauId, 12);
    const lastData = historicalData[historicalData.length - 1];
    
    // Simulation simple basée sur la moyenne des 3 derniers mois
    const recentMonths = historicalData.slice(-3);
    const avgIncome = recentMonths.reduce((sum, data) => sum + data.income, 0) / recentMonths.length;
    const avgExpense = recentMonths.reduce((sum, data) => sum + data.expense, 0) / recentMonths.length;

    const forecast = [];
    const currentDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 1);
      const monthName = forecastDate.toLocaleDateString('fr-FR', { month: 'short' });
      
      // Ajouter une variation aléatoire de ±10% pour la simulation
      const variation = 1 + (Math.random() * 0.2 - 0.1);
      
      forecast.push({
        period: monthName,
        income: avgIncome * variation,
        expense: avgExpense * variation
      });
    }

    return {
      labels: forecast.map(f => f.period),
      datasets: [
        {
          label: 'Entrées prévues',
          data: forecast.map(f => f.income),
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10b981',
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Sorties prévues',
          data: forecast.map(f => f.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: '#ef4444',
          borderWidth: 2,
          fill: true
        }
      ]
    };
  }

  private static getAccountTypeDisplayName(type: string): string {
    const types: { [key: string]: string } = {
      'BANQUE': 'Banque',
      'PAYPAL': 'PayPal',
      'CAISSE': 'Caisse',
      'MOBILE_MONEY': 'Mobile Money',
      'OTHER': 'Autre'
    };
    
    return types[type] || type;
  }
}