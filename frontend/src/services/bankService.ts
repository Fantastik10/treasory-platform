import { api } from './api';

export interface BankConnection {
  id: string;
  bankName: string;
  connectionType: string;
  country: string;
  isActive: boolean;
  lastSync?: string;
  bureauId: string;
  syncConfig?: {
    frequency: string;
    autoSync: boolean;
    syncTransactions: boolean;
    syncBalance: boolean;
    lastSuccess?: string;
    lastError?: string;
  };
  bureau?: {
    id: string;
    name: string;
    color: string;
  };
  _count?: {
    syncLogs: number;
  };
}

export interface SyncLog {
  id: string;
  type: string;
  status: string;
  details?: string;
  transactionsSynced?: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface ConnectionStatus {
  isActive: boolean;
  lastSync?: string;
  lastSuccessfulSync?: string;
  lastError?: string;
  totalSuccessfulSyncs: number;
  recentLogs: SyncLog[];
}

export interface TestConnectionData {
  connectionType: string;
  credentials: any;
}

export interface CreateConnectionData {
  bankName: string;
  connectionType: string;
  country: string;
  credentials: any;
  syncConfig?: {
    frequency: string;
    autoSync: boolean;
    syncTransactions: boolean;
    syncBalance: boolean;
  };
}

export interface SupportedBank {
  value: string;
  label: string;
  type: string;
}

export const bankService = {
  async testConnection(data: TestConnectionData): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/sync/test-connection', data);
    return response.data.data;
  },

  async createConnection(bureauId: string, data: CreateConnectionData): Promise<BankConnection> {
    const response = await api.post(`/bank-config/bureau/${bureauId}/connections`, data);
    return response.data.data;
  },

  async getBureauConnections(bureauId: string): Promise<BankConnection[]> {
    const response = await api.get(`/bank-config/bureau/${bureauId}/connections`);
    return response.data.data;
  },

  async getConnection(connectionId: string): Promise<BankConnection> {
    const response = await api.get(`/bank-config/connections/${connectionId}`);
    return response.data.data;
  },

  async getConnectionStatus(connectionId: string): Promise<{ connection: BankConnection; status: ConnectionStatus }> {
    const response = await api.get(`/sync/connection/${connectionId}/status`);
    return response.data.data;
  },

  async updateConnection(connectionId: string, data: Partial<CreateConnectionData>): Promise<BankConnection> {
    const response = await api.put(`/bank-config/connections/${connectionId}`, data);
    return response.data.data;
  },

  async deleteConnection(connectionId: string): Promise<void> {
    await api.delete(`/bank-config/connections/${connectionId}`);
  },

  async syncConnection(connectionId: string): Promise<void> {
    await api.post(`/sync/connection/${connectionId}/sync`);
  },

  async getSyncLogs(connectionId: string, page: number = 1, limit: number = 20): Promise<{ logs: SyncLog[]; totalCount: number; totalPages: number; currentPage: number }> {
    const response = await api.get(`/sync/connection/${connectionId}/logs?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async getSupportedBanks(countryCode: string): Promise<SupportedBank[]> {
    const response = await api.get(`/bank-config/supported-banks/${countryCode}`);
    return response.data.data;
  },

  async setupExcelSync(bureauId: string, data: { filePath: string; accountId: string }): Promise<void> {
    await api.post(`/sync/bureau/${bureauId}/excel-sync`, data);
  },

  async downloadExcelTemplate(): Promise<Blob> {
    const response = await api.get('/sync/excel-template', {
      responseType: 'blob'
    });
    return response.data;
  }
};