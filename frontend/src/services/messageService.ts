import { api } from './api';

export interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    email: string;
    role: string;
  };
  bureauId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateMessageData {
  content: string;
  bureauId: string;
}

export const messageService = {
  async createMessage(data: CreateMessageData): Promise<Message> {
    const response = await api.post('/messages', data);
    return response.data.data;
  },

  async getMessagesByBureau(bureauId: string, page: number = 1, limit: number = 50): Promise<MessagesResponse> {
    const response = await api.get(`/messages/bureau/${bureauId}?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async deleteMessage(id: string): Promise<void> {
    await api.delete(`/messages/${id}`);
  }
};