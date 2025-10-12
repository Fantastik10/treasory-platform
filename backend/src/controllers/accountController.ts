import { Request, Response } from 'express';
import { AccountService } from '../services/accountService';
import { z } from 'zod';

const createAccountSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.enum(['BANQUE', 'PAYPAL', 'CAISSE', 'MOBILE_MONEY', 'OTHER']),
  balance: z.number().min(0, 'Le solde ne peut pas être négatif'),
  currency: z.string().min(1, 'La devise est requise'),
  bureauId: z.string().uuid('ID bureau invalide')
});

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  balance: z.number().min(0).optional(),
  currency: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

export const accountController = {
  async create(req: Request, res: Response) {
    try {
      const data = createAccountSchema.parse(req.body);
      const account = await AccountService.createAccount(data);
      
      res.status(201).json({
        message: 'Compte créé avec succès',
        data: account
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la création du compte'
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const account = await AccountService.getAccountById(id);
      
      if (!account) {
        res.status(404).json({ error: 'Compte non trouvé' });
        return;
      }
      
      res.json({
        message: 'Compte récupéré avec succès',
        data: account
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération du compte'
      });
    }
  },

  async getByBureau(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const accounts = await AccountService.getAccountsByBureau(bureauId);
      
      res.json({
        message: 'Comptes récupérés avec succès',
        data: accounts
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des comptes'
      });
    }
  },

  async getSummary(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const summary = await AccountService.getAccountsSummary(bureauId);
      
      res.json({
        message: 'Résumé des comptes récupéré avec succès',
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération du résumé'
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateAccountSchema.parse(req.body);
      const account = await AccountService.updateAccount(id, data);
      
      res.json({
        message: 'Compte mis à jour avec succès',
        data: account
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du compte'
      });
    }
  },

  async updateBalance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { balance } = req.body;
      
      if (typeof balance !== 'number') {
        res.status(400).json({ error: 'Le solde est requis et doit être un nombre' });
        return;
      }
      
      const account = await AccountService.updateAccountBalance(id, balance);
      
      res.json({
        message: 'Solde du compte mis à jour avec succès',
        data: account
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du solde'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AccountService.deleteAccount(id);
      
      res.json({
        message: 'Compte supprimé avec succès'
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du compte'
      });
    }
  }
};