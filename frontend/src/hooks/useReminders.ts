// frontend/src/hooks/useReminders.ts
import { useState, useEffect } from 'react';
import reminderService, { Reminder, ReminderStats, ReminderConfig } from '../services/reminderService';

export const useReminders = (bureauId: number, filters?: any) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReminderHistory = async () => {
    if (!bureauId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await reminderService.getReminderHistory(bureauId, filters);
      setReminders(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const fetchReminderStats = async () => {
    if (!bureauId) return;
    
    try {
      const data = await reminderService.getReminderStats(bureauId);
      setStats(data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  useEffect(() => {
    fetchReminderHistory();
    fetchReminderStats();
  }, [bureauId, filters?.status, filters?.type]);

  const updateConfig = async (donorId: number, config: Partial<ReminderConfig>) => {
    try {
      const updated = await reminderService.updateReminderConfig(donorId, config);
      return updated;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const sendManualReminder = async (donorId: number, data: { message: string; sujet: string }) => {
    try {
      const reminder = await reminderService.sendManualReminder(donorId, data);
      await fetchReminderHistory(); // Rafraîchir l'historique
      return reminder;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
      throw err;
    }
  };

  return {
    reminders,
    stats,
    loading,
    error,
    updateConfig,
    sendManualReminder,
    refetch: fetchReminderHistory
  };
};