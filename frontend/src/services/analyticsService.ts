import { api } from './api';

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
    fill?: boolean;
  }>;
}

export const analyticsService = {
  async getDashboardStats(bureauId: string): Promise<DashboardStats> {
    const response = await api.get(`/analytics/bureau/${bureauId}/dashboard-stats`);
    return response.data.data;
  },

  async getIncomeExpenseChart(bureauId: string, year?: number): Promise<ChartData> {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/analytics/bureau/${bureauId}/charts/income-expense${params}`);
    return response.data.data;
  },

  async getAccountDistributionChart(bureauId: string): Promise<ChartData> {
    const response = await api.get(`/analytics/bureau/${bureauId}/charts/account-distribution`);
    return response.data.data;
  },

  async getCategoryChart(bureauId: string, months: number = 6): Promise<ChartData> {
    const response = await api.get(`/analytics/bureau/${bureauId}/charts/categories?months=${months}`);
    return response.data.data;
  },

  async getCashFlowForecast(bureauId: string, months: number = 3): Promise<ChartData> {
    const response = await api.get(`/analytics/bureau/${bureauId}/charts/cash-flow-forecast?months=${months}`);
    return response.data.data;
  },

  async getTransactionTrends(bureauId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<ChartData> {
    const response = await api.get(`/analytics/bureau/${bureauId}/charts/transaction-trends?period=${period}`);
    return response.data.data;
  },

  async getCategoryAnalysis(bureauId: string): Promise<ChartData> {
    const response = await api.get(`/analytics/bureau/${bureauId}/charts/category-analysis`);
    return response.data.data;
  },

  async getMonthlyComparison(bureauId: string, year?: number): Promise<ChartData> {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/analytics/bureau/${bureauId}/charts/monthly-comparison${params}`);
    return response.data.data;
  },

  async getAccountPerformance(bureauId: string): Promise<ChartData> {
    const response = await api.get(`/analytics/bureau/${bureauId}/charts/account-performance`);
    return response.data.data;
  },

  async generateFinancialReport(bureauId: string, period: string = 'month'): Promise<Blob> {
    const response = await api.get(`/analytics/bureau/${bureauId}/reports/financial?period=${period}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async generateAnalyticsReport(bureauId: string): Promise<Blob> {
    const response = await api.get(`/analytics/bureau/${bureauId}/reports/analytics`, {
      responseType: 'blob'
    });
    return response.data;
  }
};