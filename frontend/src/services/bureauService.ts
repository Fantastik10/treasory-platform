import { api } from './api';

export interface Bureau {
  id: string;
  name: string;
  color: string;
  country: string;
  espaceTravailId: string;
  users: Array<{
    id: string;
    email: string;
    role: string;
  }>;
  _count?: {
    users: number;
    messages: number;
  };
}

export interface CreateBureauData {
  name: string;
  color: string;
  country: string;
  espaceTravailId: string;
}

export interface UpdateBureauData {
  name?: string;
  color?: string;
  country?: string;
}

export const bureauService = {
  async createBureau(data: CreateBureauData): Promise<Bureau> {
    const response = await api.post('/bureaux', data);
    return response.data.data;
  },

  async getBureauById(id: string): Promise<Bureau> {
    const response = await api.get(`/bureaux/${id}`);
    return response.data.data;
  },

  async getBureauxByEspace(espaceId: string): Promise<Bureau[]> {
    const response = await api.get(`/bureaux/espace/${espaceId}`);
    return response.data.data;
  },

  async updateBureau(id: string, data: UpdateBureauData): Promise<Bureau> {
    const response = await api.put(`/bureaux/${id}`, data);
    return response.data.data;
  },

  async updateBureauColor(id: string, color: string): Promise<Bureau> {
    const response = await api.patch(`/bureaux/${id}/color`, { color });
    return response.data.data;
  },

  async deleteBureau(id: string): Promise<void> {
    await api.delete(`/bureaux/${id}`);
  }
};