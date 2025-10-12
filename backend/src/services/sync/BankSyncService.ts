import { prisma } from '../../config/database';
import { SyncService } from './SyncService';

export class BankSyncService {
  static async syncAllActiveConnections() {
    const activeConnections = await prisma.bankConnection.findMany({
      where: { 
        isActive: true,
        syncConfig: {
          autoSync: true
        }
      },
      include: {
        syncConfig: true,
        bureau: {
          include: {
            users: {
              where: { role: 'ADMIN_1' },
              take: 1
            }
          }
        }
      }
    });

    console.log(`[BankSync] Starting sync for ${activeConnections.length} active connections`);

    const results = [];

    for (const connection of activeConnections) {
      try {
        const adminUser = connection.bureau.users[0];
        if (!adminUser) continue;

        await SyncService.syncBankConnection(connection.id, adminUser.id);
        results.push({ connectionId: connection.id, status: 'success' });
      } catch (error) {
        console.error(`[BankSync] Failed to sync connection ${connection.id}:`, error);
        results.push({ connectionId: connection.id, status: 'error', error });
      }
    }

    console.log(`[BankSync] Completed: ${results.filter(r => r.status === 'success').length} successful, ${results.filter(r => r.status === 'error').length} failed`);
    return results;
  }

  static async getConnectionStatus(connectionId: string) {
    const connection = await prisma.bankConnection.findUnique({
      where: { id: connectionId },
      include: {
        syncConfig: true,
        syncLogs: {
          orderBy: { startedAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            syncLogs: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      }
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    const lastSuccessfulSync = connection.syncLogs.find(log => log.status === 'COMPLETED');
    const lastFailedSync = connection.syncLogs.find(log => log.status === 'FAILED');

    return {
      connection,
      status: {
        isActive: connection.isActive,
        lastSync: connection.lastSync,
        lastSuccessfulSync: lastSuccessfulSync?.completedAt || null,
        lastError: lastFailedSync?.errorMessage || connection.syncConfig?.lastError,
        totalSuccessfulSyncs: connection._count.syncLogs,
        recentLogs: connection.syncLogs
      }
    };
  }
}