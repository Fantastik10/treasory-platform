import { prisma } from '../config/database';
import { SyncService } from '../services/sync/SyncService';

export class BankSyncJob {
  static async runForConnection(connectionId: string) {
    const connection = await prisma.bankConnection.findUnique({
      where: { id: connectionId },
      include: {
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

    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const adminUser = connection.bureau.users[0];
    if (!adminUser) {
      throw new Error(`No admin user found for bureau ${connection.bureauId}`);
    }

    await SyncService.syncBankConnection(connectionId, adminUser.id);
  }

  static async runForBureau(bureauId: string) {
    const connections = await prisma.bankConnection.findMany({
      where: { 
        bureauId,
        isActive: true 
      }
    });

    const results = [];

    for (const connection of connections) {
      try {
        await this.runForConnection(connection.id);
        results.push({ connectionId: connection.id, status: 'success' });
      } catch (error) {
        results.push({ 
          connectionId: connection.id, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }
}