import { api } from './api';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  bureauId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bureau?: {
    id: string;
    name: string;
    color: string;
  };
  _count?: {
    transactions: number;
  };
}

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

export interface AccountsSummary {
  totalBalance: number;
  byType: Record<string, { count: number; balance: number }>;
  accounts: Account[];
}

export const accountService = {
  async createAccount(data: CreateAccountData): Promise<Account> {
    const response = await api.post('/accounts', data);
    return response.data.data;
  },

  async getAccountById(id: string): Promise<Account> {
    const response = await api.get(`/accounts/${id}`);
    return response.data.data;
  },

  async getAccountsByBureau(bureauId: string): Promise<Account[]> {
    const response = await api.get(`/accounts/bureau/${bureauId}`);
    return response.data.data;
  },

  async getAccountsSummary(bureauId: string): Promise<AccountsSummary> {
    const response = await api.get(`/accounts/bureau/${bureauId}/summary`);
    return response.data.data;
  },

  async updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
    const response = await api.put(`/accounts/${id}`, data);
    return response.data.data;
  },

  async updateAccountBalance(id: string, balance: number): Promise<Account> {
    const response = await api.patch(`/accounts/${id}/balance`, { balance });
    return response.data.data;
  },

  async deleteAccount(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  }
};