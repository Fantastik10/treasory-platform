import { api } from './api';

export interface GlobalBalance {
  totalBalance: number;
  balanceByType: Record<string, number>;
  accountCount: number;
}

export interface FinancialOverview {
  globalBalance: GlobalBalance;
  currentMonth: {
    income: number;
    transactionCount: number;
  };
  lastMonth: {
    income: number;
  };
  recentTransactions: any[];
  monthlyEvolution: MonthlyEvolution[];
}

export interface MonthlyEvolution {
  period: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
}

export interface YearlySummary {
  monthlyData: Array<{
    month: number;
    period: string;
    totalIncome: number;
    totalExpense: number;
    netFlow: number;
  }>;
  annualTotals: {
    totalIncome: number;
    totalExpense: number;
    netFlow: number;
  };
  year: number;
}

export const financialService = {
  async getGlobalBalance(bureauId: string): Promise<GlobalBalance> {
    const response = await api.get(`/financial/bureau/${bureauId}/balance`);
    return response.data.data;
  },

  async getFinancialOverview(bureauId: string): Promise<FinancialOverview> {
    const response = await api.get(`/financial/bureau/${bureauId}/overview`);
    return response.data.data;
  },

  async getMonthlyEvolution(
    bureauId: string, 
    months: number = 6
  ): Promise<MonthlyEvolution[]> {
    const response = await api.get(
      `/financial/bureau/${bureauId}/monthly-evolution?months=${months}`
    );
    return response.data.data;
  },

  async getYearlySummary(bureauId: string, year?: number): Promise<YearlySummary> {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/financial/bureau/${bureauId}/yearly-summary${params}`);
    return response.data.data;
  },

  async exportData(
    bureauId: string, 
    format: 'excel' | 'pdf' = 'excel',
    filters: any = {}
  ): Promise<Blob> {
    const params = new URLSearchParams({ format, ...filters });
    const response = await api.get(`/financial/bureau/${bureauId}/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};