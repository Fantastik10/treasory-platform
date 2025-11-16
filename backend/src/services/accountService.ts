// backend/src/services/accountService.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Account } from '../models/Account';
import { Bureau } from '../models/Bureau';

export interface CreateAccountData {
  name: string;
  type: string;
  balance: number;
  currency: string;
  bureauId: string;
}

export interface UpdateAccountData {
  name?: string;
  balance?: number;
  currency?: string;
  isActive?: boolean;
}

export class AccountService {
  private accountRepository: Repository<Account>;
  private bureauRepository: Repository<Bureau>;

  constructor() {
    this.accountRepository = AppDataSource.getRepository(Account);
    this.bureauRepository = AppDataSource.getRepository(Bureau);
  }

  async createAccount(data: CreateAccountData) {
    const bureau = await this.bureauRepository.findOne({ 
      where: { id: parseInt(data.bureauId) }
    });

    if (!bureau) {
      throw new Error('Bureau non trouvé');
    }

    const account = this.accountRepository.create({
      nom: data.name,
      type: data.type,
      solde: data.balance,
      bureau: bureau
    });

    const savedAccount = await this.accountRepository.save(account);
    
    // Retourner avec les relations
    return await this.accountRepository.findOne({
      where: { id: savedAccount.id },
      relations: ['bureau']
    });
  }

  async getAccountById(accountId: string) {
    return await this.accountRepository.findOne({
      where: { id: parseInt(accountId) },
      relations: ['bureau']
    });
  }

  async getAccountsByBureau(bureauId: string) {
    return await this.accountRepository.find({
      where: { bureau: { id: parseInt(bureauId) } },
      relations: ['bureau'],
      order: { type: 'ASC' }
    });
  }

  async updateAccount(accountId: string, data: UpdateAccountData) {
    const updateData: any = {};
    
    if (data.name) updateData.nom = data.name;
    if (data.balance !== undefined) updateData.solde = data.balance;
    if (data.currency) updateData.currency = data.currency;
    if (data.isActive !== undefined) updateData.actif = data.isActive;

    await this.accountRepository.update(parseInt(accountId), updateData);
    
    return await this.accountRepository.findOne({
      where: { id: parseInt(accountId) },
      relations: ['bureau']
    });
  }

  async updateAccountBalance(accountId: string, newBalance: number) {
    await this.accountRepository.update(parseInt(accountId), { solde: newBalance });
    
    return await this.accountRepository.findOne({
      where: { id: parseInt(accountId) },
      relations: ['bureau']
    });
  }

  async deleteAccount(accountId: string) {
    // Vérifier s'il y a des transactions associées
    // Note: Tu devras adapter cette partie selon ton modèle Transaction
    // const transactionsCount = await this.transactionRepository.count({
    //   where: { account: { id: parseInt(accountId) } }
    // });

    // if (transactionsCount > 0) {
    //   throw new Error('Impossible de supprimer un compte avec des transactions');
    // }

    const result = await this.accountRepository.delete(parseInt(accountId));
    
    if (result.affected === 0) {
      throw new Error('Compte non trouvé');
    }
    
    return { success: true };
  }

  async getAccountsSummary(bureauId: string) {
    const accounts = await this.getAccountsByBureau(bureauId);
    
    const summary = {
      totalBalance: 0,
      byType: {} as Record<string, { count: number; balance: number }>,
      accounts: accounts
    };

    accounts.forEach(account => {
      summary.totalBalance += account.solde;
      
      if (!summary.byType[account.type]) {
        summary.byType[account.type] = { count: 0, balance: 0 };
      }
      
      summary.byType[account.type].count++;
      summary.byType[account.type].balance += account.solde;
    });

    return summary;
  }

  // Méthode statique pour la compatibilité
  static async getAccountsByBureauStatic(bureauId: string) {
    const service = new AccountService();
    return await service.getAccountsByBureau(bureauId);
  }

  static async getAccountsSummaryStatic(bureauId: string) {
    const service = new AccountService();
    return await service.getAccountsSummary(bureauId);
  }
}