import { api } from './api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  content?: string;
  isRead: boolean;
  bureau?: {
    id: string;
    name: string;
    color: string;
  };
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const notificationService = {
  async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationsResponse> {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/mark-all-read');
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.unreadCount;
  }
};