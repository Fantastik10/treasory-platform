// backend/src/jobs/syncScheduler.ts
import cron from 'node-cron';
import { BankSyncService } from '../services/sync/BankSyncService';
import { ReminderJob } from './reminderJob';

export class SyncScheduler {
  static start() {
    console.log('[Scheduler] Starting sync scheduler...');

    // Toutes les heures
    cron.schedule('0 * * * *', async () => {
      console.log('[Scheduler] Running hourly sync...');
      try {
        await BankSyncService.syncAllActiveConnections();
      } catch (error) {
        console.error('[Scheduler] Error during hourly sync:', error);
      }
    });

    // Tous les jours à minuit
    cron.schedule('0 0 * * *', async () => {
      console.log('[Scheduler] Running daily sync...');
      try {
        // Log quotidien des stats
        const results = await BankSyncService.syncAllActiveConnections();
        console.log('[Scheduler] Daily sync completed:', results);
      } catch (error) {
        console.error('[Scheduler] Error during daily sync:', error);
      }
    });

    // Démarrer le job de relances
    const reminderJob = new ReminderJob();
    reminderJob.start();
    
    console.log('✅ Job de relances automatiques démarré');
    console.log('[Scheduler] Sync scheduler started');
  }

  static stop() {
    console.log('[Scheduler] Stopping sync scheduler...');
    // node-cron n'a pas de méthode stop globale
    // En production, on gérerait proprement l'arrêt
  }
}