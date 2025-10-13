// frontend/src/services/reminderService.ts
import api from './api';

export interface Reminder {
  id: number;
  type: 'email' | 'sms';
  message: string;
  status: 'sent' | 'failed' | 'scheduled';
  errorMessage?: string;
  sentAt: string;
  donor: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

export interface ReminderConfig {
  relancesActives: boolean;
  relanceApresJours: number;
  frequenceRelance: 'une_fois' | 'tous_7j';
  notifierAdmin: boolean;
}

export interface ReminderStats {
  total: number;
  sent: number;
  failed: number;
  last30Days: number;
}

class ReminderService {
  async getReminderHistory(bureauId: number, filters?: any): Promise<Reminder[]> {
    const response = await api.get(`/bureau/${bureauId}/reminders/history`, { 
      params: filters 
    });
    return response.data;
  }

  async getReminderStats(bureauId: number): Promise<ReminderStats> {
    const response = await api.get(`/bureau/${bureauId}/reminders/stats`);
    return response.data;
  }

  async updateReminderConfig(donorId: number, config: Partial<ReminderConfig>): Promise<any> {
    const response = await api.put(`/donors/${donorId}/reminder-config`, config);
    return response.data;
  }

  async sendManualReminder(donorId: number, data: { message: string; sujet: string }): Promise<Reminder> {
    const response = await api.post(`/donors/${donorId}/remind`, data);
    return response.data;
  }
}

export default new ReminderService();