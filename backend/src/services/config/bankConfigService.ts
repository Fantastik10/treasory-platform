import { prisma } from '../../config/database';
import { encrypt, decrypt } from '../../utils/encryption';

export interface CreateBankConnectionData {
  bankName: string;
  connectionType: string;
  country: string;
  credentials: any;
  bureauId: string;
  syncConfig?: {
    frequency: string;
    autoSync: boolean;
    syncTransactions: boolean;
    syncBalance: boolean;
  };
}

export class BankConfigService {
  static async createBankConnection(data: CreateBankConnectionData) {
    // Chiffrer les credentials
    const encryptedCredentials = encrypt(JSON.stringify(data.credentials));

    const connection = await prisma.bankConnection.create({
      data: {
        bankName: data.bankName,
        connectionType: data.connectionType as any,
        country: data.country,
        credentials: encryptedCredentials,
        bureauId: data.bureauId,
        syncConfig: data.syncConfig ? {
          create: {
            frequency: data.syncConfig.frequency as any,
            autoSync: data.syncConfig.autoSync,
            syncTransactions: data.syncConfig.syncTransactions,
            syncBalance: data.syncConfig.syncBalance
          }
        } : undefined
      },
      include: {
        syncConfig: true,
        bureau: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return connection;
  }

  static async getBankConnection(connectionId: string) {
    const connection = await prisma.bankConnection.findUnique({
      where: { id: connectionId },
      include: {
        syncConfig: true,
        bureau: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        syncLogs: {
          orderBy: { startedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!connection) {
      throw new Error('Bank connection not found');
    }

    // Ne pas renvoyer les credentials chiffrés
    const { credentials, ...safeConnection } = connection;
    return safeConnection;
  }

  static async getBureauConnections(bureauId: string) {
    const connections = await prisma.bankConnection.findMany({
      where: { bureauId },
      include: {
        syncConfig: true,
        _count: {
          select: {
            syncLogs: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Ne pas renvoyer les credentials
    return connections.map(({ credentials, ...connection }) => connection);
  }

  static async updateBankConnection(connectionId: string, updates: any) {
    const data: any = {};

    if (updates.bankName) data.bankName = updates.bankName;
    if (updates.country) data.country = updates.country;
    if (updates.isActive !== undefined) data.isActive = updates.isActive;

    if (updates.credentials) {
      data.credentials = encrypt(JSON.stringify(updates.credentials));
    }

    if (updates.syncConfig) {
      data.syncConfig = {
        upsert: {
          create: {
            frequency: updates.syncConfig.frequency as any,
            autoSync: updates.syncConfig.autoSync ?? true,
            syncTransactions: updates.syncConfig.syncTransactions ?? true,
            syncBalance: updates.syncConfig.syncBalance ?? true
          },
          update: {
            frequency: updates.syncConfig.frequency as any,
            autoSync: updates.syncConfig.autoSync,
            syncTransactions: updates.syncConfig.syncTransactions,
            syncBalance: updates.syncConfig.syncBalance
          }
        }
      };
    }

    const connection = await prisma.bankConnection.update({
      where: { id: connectionId },
      data,
      include: {
        syncConfig: true,
        bureau: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Ne pas renvoyer les credentials
    const { credentials, ...safeConnection } = connection;
    return safeConnection;
  }

  static async deleteBankConnection(connectionId: string) {
    await prisma.bankConnection.delete({
      where: { id: connectionId }
    });
  }

  static async getSupportedBanksByCountry(countryCode: string) {
    const banksByCountry: { [key: string]: Array<{ value: string; label: string; type: string }> } = {
      'FR': [
        { value: 'BNP_PARIBAS', label: 'BNP Paribas', type: 'BANQUE' },
        { value: 'SOCIETE_GENERALE', label: 'Société Générale', type: 'BANQUE' },
        { value: 'PAYPAL', label: 'PayPal', type: 'PAYPAL' }
      ],
      'CI': [
        { value: 'ORANGE_MONEY', label: 'Orange Money', type: 'MOBILE_MONEY' },
        { value: 'MTN_MONEY', label: 'MTN Money', type: 'MOBILE_MONEY' },
        { value: 'WAVE', label: 'Wave', type: 'MOBILE_MONEY' }
      ],
      'SN': [
        { value: 'WAVE', label: 'Wave', type: 'MOBILE_MONEY' },
        { value: 'ORANGE_MONEY', label: 'Orange Money', type: 'MOBILE_MONEY' }
      ]
    };

    return banksByCountry[countryCode] || [];
  }
}