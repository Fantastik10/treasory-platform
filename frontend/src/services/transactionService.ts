import { api } from './api';

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  category?: string;
  date: string;
  accountId: string;
  bureauId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  account?: {
    id: string;
    name: string;
    type: string;
  };
  createdBy?: {
    id: string;
    email: string;
  };
  bureau?: {
    id: string;
    name: string;
  };
}

export interface TransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateTransactionData {
  amount: number;
  type: string;
  description: string;
  category?: string;
  date: string;
  accountId: string;
  bureauId: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  category?: string;
  accountId?: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  byCategory: Record<string, number>;
  byAccountType: Record<string, { income: number; expense: number }>;
}

export const transactionService = {
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post('/transactions', data);
    return response.data.data;
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    return response.data.data;
  },

  async getTransactionsByBureau(
    bureauId: string, 
    filters: TransactionFilters = {},
    page: number = 1, 
    limit: number = 50
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await api.get(`/transactions/bureau/${bureauId}?${params}`);
    return response.data.data;
  },

  async getTransactionsByAccount(
    accountId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<TransactionsResponse> {
    const response = await api.get(
      `/transactions/account/${accountId}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  async getMonthlySummary(
    bureauId: string, 
    year: number, 
    month?: number
  ): Promise<MonthlySummary> {
    const params = new URLSearchParams({ year: year.toString() });
    if (month) params.append('month', month.toString());
    
    const response = await api.get(
      `/transactions/bureau/${bureauId}/monthly-summary?${params}`
    );
    return response.data.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  }
};