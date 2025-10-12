import { prisma } from '../../config/database';
import { BankAdapter, BankCredentials } from '../bank-adapters/BaseAdapter';
import { BNPAdapter } from '../bank-adapters/BNPAdapter';
import { PayPalAdapter } from '../bank-adapters/PayPalAdapter';
import { OrangeMoneyAdapter } from '../bank-adapters/OrangeMoneyAdapter';
import { MTNMoneyAdapter } from '../bank-adapters/MTNMoneyAdapter';
import { WaveAdapter } from '../bank-adapters/WaveAdapter';
import { TransactionService } from '../transactionService';
import { AccountService } from '../accountService';
import { encrypt, decrypt } from '../../utils/encryption';

export class SyncService {
  private static getAdapter(connectionType: string, encryptedCredentials: string): BankAdapter {
    const credentials: BankCredentials = JSON.parse(decrypt(encryptedCredentials));
    
    switch (connectionType) {
      case 'BNP_PARIBAS':
        return new BNPAdapter(credentials);
      case 'PAYPAL':
        return new PayPalAdapter(credentials);
      case 'ORANGE_MONEY':
        return new OrangeMoneyAdapter(credentials);
      case 'MTN_MONEY':
        return new MTNMoneyAdapter(credentials);
      case 'WAVE':
        return new WaveAdapter(credentials);
      default:
        throw new Error(`Unsupported bank type: ${connectionType}`);
    }
  }

  static async syncBankConnection(connectionId: string, userId: string) {
    const connection = await prisma.bankConnection.findUnique({
      where: { id: connectionId },
      include: { syncConfig: true, bureau: true }
    });

    if (!connection) {
      throw new Error('Bank connection not found');
    }

    // Créer un log de synchronisation
    const syncLog = await prisma.syncLog.create({
      data: {
        bankConnectionId: connectionId,
        type: 'MANUAL_SYNC',
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });

    try {
      const adapter = this.getAdapter(connection.connectionType, connection.credentials);
      
      // Étape 1: Connexion
      await adapter.connect();

      // Étape 2: Récupération du solde
      const balance = await adapter.getBalance();
      
      // Mettre à jour ou créer le compte associé
      const accountName = `${connection.bankName} - ${connection.bureau.name}`;
      const accountType = this.mapBankTypeToAccountType(connection.connectionType);
      
      let account = await prisma.account.findFirst({
        where: {
          bureauId: connection.bureauId,
          type: accountType
        }
      });

      if (account) {
        // Mettre à jour le solde du compte existant
        await AccountService.updateAccountBalance(account.id, balance.amount);
      } else {
        // Créer un nouveau compte
        account = await AccountService.createAccount({
          name: accountName,
          type: accountType,
          balance: balance.amount,
          currency: balance.currency,
          bureauId: connection.bureauId
        });
      }

      // Étape 3: Récupération des transactions
      const lastSyncDate = connection.lastSync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut
      const transactions = await adapter.getTransactions(lastSyncDate, new Date());

      // Étape 4: Import des transactions
      let transactionsSynced = 0;
      
      for (const bankTransaction of transactions) {
        // Vérifier si la transaction existe déjà
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            accountId: account.id,
            description: bankTransaction.description,
            amount: bankTransaction.amount,
            date: bankTransaction.date
          }
        });

        if (!existingTransaction) {
          await TransactionService.createTransaction({
            amount: bankTransaction.amount,
            type: bankTransaction.type,
            description: bankTransaction.description,
            category: bankTransaction.category,
            date: bankTransaction.date,
            accountId: account.id,
            bureauId: connection.bureauId,
            createdById: userId
          });
          transactionsSynced++;
        }
      }

      // Étape 5: Mettre à jour la connexion
      await prisma.bankConnection.update({
        where: { id: connectionId },
        data: {
          lastSync: new Date(),
          isActive: true
        }
      });

      if (connection.syncConfig) {
        await prisma.syncConfig.update({
          where: { id: connection.syncConfig.id },
          data: { lastSuccess: new Date() }
        });
      }

      // Étape 6: Mettre à jour le log
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          transactionsSynced,
          details: `Synchronisation réussie: ${transactionsSynced} nouvelles transactions`
        }
      });

      console.log(`[Sync] Successfully synced ${connection.bankName}: ${transactionsSynced} new transactions`);

    } catch (error) {
      // En cas d'erreur, mettre à jour le log
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      if (connection.syncConfig) {
        await prisma.syncConfig.update({
          where: { id: connection.syncConfig.id },
          data: { 
            lastError: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }

      console.error(`[Sync] Failed to sync ${connection.bankName}:`, error);
      throw error;
    }
  }

  static async testConnection(connectionType: string, credentials: BankCredentials) {
    const encryptedCredentials = encrypt(JSON.stringify(credentials));
    const adapter = this.getAdapter(connectionType, encryptedCredentials);
    
    try {
      const isValid = await adapter.validateCredentials();
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const connected = await adapter.connect();
      if (!connected) {
        throw new Error('Failed to connect');
      }

      // Test de récupération du solde
      await adapter.getBalance();
      
      adapter.disconnect();
      
      return { success: true, message: 'Connection test successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  private static mapBankTypeToAccountType(bankType: string): string {
    const mapping: { [key: string]: string } = {
      'BNP_PARIBAS': 'BANQUE',
      'SOCIETE_GENERALE': 'BANQUE',
      'PAYPAL': 'PAYPAL',
      'ORANGE_MONEY': 'MOBILE_MONEY',
      'MTN_MONEY': 'MOBILE_MONEY',
      'WAVE': 'MOBILE_MONEY'
    };

    return mapping[bankType] || 'OTHER';
  }

  static async getSyncLogs(connectionId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      prisma.syncLog.findMany({
        where: { bankConnectionId: connectionId },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.syncLog.count({
        where: { bankConnectionId: connectionId }
      })
    ]);

    return {
      logs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }
}