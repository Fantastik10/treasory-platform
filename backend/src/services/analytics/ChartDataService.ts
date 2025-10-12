import { prisma } from '../../config/database';
import { ChartData } from './AnalyticsService';

export class ChartDataService {
  static async getTransactionTrends(bureauId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<ChartData> {
    const now = new Date();
    let startDate: Date;
    let groupFormat: string;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = 'day';
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupFormat = 'day';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupFormat = 'month';
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupFormat = 'day';
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        bureauId,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Grouper les transactions par période
    const groupedData = transactions.reduce((acc, transaction) => {
      let key: string;
      const date = new Date(transaction.date);

      if (groupFormat === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      if (!acc[key]) {
        acc[key] = { income: 0, expense: 0 };
      }

      if (transaction.type === 'ENTREE') {
        acc[key].income += transaction.amount;
      } else {
        acc[key].expense += transaction.amount;
      }

      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    // Créer les labels et datasets
    const labels = Object.keys(groupedData).sort();
    
    // Formater les labels selon la période
    const formattedLabels = labels.map(label => {
      if (groupFormat === 'day') {
        return new Date(label).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      } else {
        const [year, month] = label.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('fr-FR', { month: 'short' });
      }
    });

    return {
      labels: formattedLabels,
      datasets: [
        {
          label: 'Entrées',
          data: labels.map(label => groupedData[label].income),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10b981',
          borderWidth: 2
        },
        {
          label: 'Sorties',
          data: labels.map(label => groupedData[label].expense),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: '#ef4444',
          borderWidth: 2
        }
      ]
    };
  }

  static async getCategoryAnalysis(bureauId: string): Promise<ChartData> {
    const transactions = await prisma.transaction.findMany({
      where: {
        bureauId,
        date: {
          gte: new Date(new Date().getFullYear(), 0, 1) // Depuis début d'année
        }
      }
    });

    const categoryData = transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Non catégorisé';
      const type = transaction.type;

      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0 };
      }

      if (type === 'ENTREE') {
        acc[category].income += transaction.amount;
      } else {
        acc[category].expense += transaction.amount;
      }

      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    // Trier par montant total et prendre le top 10
    const sortedCategories = Object.entries(categoryData)
      .sort(([, a], [, b]) => (b.income + b.expense) - (a.income + a.expense))
      .slice(0, 10);

    return {
      labels: sortedCategories.map(([category]) => category),
      datasets: [
        {
          label: 'Solde net',
          data: sortedCategories.map(([, data]) => data.income - data.expense),
          backgroundColor: sortedCategories.map(([, data]) => 
            (data.income - data.expense) >= 0 ? '#10b981' : '#ef4444'
          )
        }
      ]
    };
  }

  static async getMonthlyComparison(bureauId: string, year: number): Promise<ChartData> {
    const monthlyData = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const transactions = await prisma.transaction.findMany({
        where: {
          bureauId,
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const income = transactions
        .filter(t => t.type === 'ENTREE')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter(t => t.type === 'SORTIE')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({ month, income, expense });
    }

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    return {
      labels: monthNames,
      datasets: [
        {
          label: `${year} - Entrées`,
          data: monthlyData.map(data => data.income),
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: '#10b981',
          borderWidth: 2
        },
        {
          label: `${year} - Sorties`,
          data: monthlyData.map(data => data.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: '#ef4444',
          borderWidth: 2
        }
      ]
    };
  }

  static async getAccountPerformance(bureauId: string): Promise<ChartData> {
    const accounts = await prisma.account.findMany({
      where: { bureauId, isActive: true },
      include: {
        transactions: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), 0, 1)
            }
          }
        }
      }
    });

    const accountPerformance = accounts.map(account => {
      const transactions = account.transactions;
      const income = transactions
        .filter(t => t.type === 'ENTREE')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = transactions
        .filter(t => t.type === 'SORTIE')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: account.name,
        netFlow: income - expense,
        transactionCount: transactions.length
      };
    });

    // Trier par performance nette
    accountPerformance.sort((a, b) => b.netFlow - a.netFlow);

    return {
      labels: accountPerformance.map(ap => ap.name),
      datasets: [
        {
          label: 'Flux net (€)',
          data: accountPerformance.map(ap => ap.netFlow),
          backgroundColor: accountPerformance.map(ap => 
            ap.netFlow >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
          ),
          borderWidth: 1
        }
      ]
    };
  }
}