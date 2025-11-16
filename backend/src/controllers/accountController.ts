import { Request, Response } from 'express';
import { AccountService } from '../services/accountService';

export class AccountController {
  private accountService: AccountService;

  constructor() {
    this.accountService = new AccountService();
  }

  // ✅ Récupérer tous les comptes d’un bureau
  getByBureau = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bureauId } = req.params;
      const accounts = await this.accountService.getAccountsByBureau(bureauId);
      res.json(accounts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ✅ Créer un nouveau compte
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const account = await this.accountService.createAccount(req.body);
      res.status(201).json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ✅ Mettre à jour un compte
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const account = await this.accountService.updateAccount(id, req.body);
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ✅ Supprimer un compte
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.accountService.deleteAccount(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ✅ Récupérer le résumé des comptes d’un bureau
  getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bureauId } = req.params;
      const summary = await this.accountService.getAccountsSummary(bureauId);
      res.json(summary);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ✅ (optionnel) Récupérer un compte par ID
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const account = await this.accountService.getAccountById(id);
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ✅ (optionnel) Mise à jour du solde uniquement
  updateBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { balance } = req.body;
      const account = await this.accountService.updateAccountBalance(id, balance);
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
