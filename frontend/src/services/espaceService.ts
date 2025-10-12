import { api } from './api';

export interface EspaceTravail {
  id: string;
  name: string;
  bureaux: Array<{
    id: string;
    name: string;
    color: string;
    country: string;
    users: Array<{
      id: string;
      email: string;
      role: string;
    }>;
    _count?: {
      users: number;
    };
  }>;
  _count?: {
    bureaux: number;
  };
}

export interface CreateEspaceData {
  name: string;
}

export const espaceService = {
  async createEspace(data: CreateEspaceData): Promise<EspaceTravail> {
    const response = await api.post('/espaces', data);
    return response.data.data;
  },

  async getEspaceById(id: string): Promise<EspaceTravail> {
    const response = await api.get(`/espaces/${id}`);
    return response.data.data;
  },

  async getAllEspaces(): Promise<EspaceTravail[]> {
    const response = await api.get('/espaces');
    return response.data.data;
  },

  async updateEspace(id: string, name: string): Promise<EspaceTravail> {
    const response = await api.put(`/espaces/${id}`, { name });
    return response.data.data;
  },

  async deleteEspace(id: string): Promise<void> {
    await api.delete(`/espaces/${id}`);
  }
};