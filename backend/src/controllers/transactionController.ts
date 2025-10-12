import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { z } from 'zod';

const createTransactionSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  type: z.enum(['ENTREE', 'SORTIE']),
  description: z.string().min(1, 'La description est requise'),
  category: z.string().optional(),
  date: z.string().transform(str => new Date(str)),
  accountId: z.string().uuid('ID compte invalide'),
  bureauId: z.string().uuid('ID bureau invalide')
});

const getTransactionsSchema = z.object({
  startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  type: z.enum(['ENTREE', 'SORTIE']).optional(),
  category: z.string().optional(),
  accountId: z.string().uuid().optional()
});

export const transactionController = {
  async create(req: Request, res: Response) {
    try {
      const data = createTransactionSchema.parse(req.body);
      const userId = (req as any).user.userId;
      
      const transaction = await TransactionService.createTransaction({
        ...data,
        createdById: userId
      });
      
      res.status(201).json({
        message: 'Transaction créée avec succès',
        data: transaction
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la transaction'
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(id);
      
      if (!transaction) {
        res.status(404).json({ error: 'Transaction non trouvée' });
        return;
      }
      
      res.json({
        message: 'Transaction récupérée avec succès',
        data: transaction
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération de la transaction'
      });
    }
  },

  async getByBureau(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const filters = getTransactionsSchema.parse(req.query);
      
      const result = await TransactionService.getTransactionsByBureau(
        bureauId, 
        filters, 
        page, 
        limit
      );
      
      res.json({
        message: 'Transactions récupérées avec succès',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des transactions'
      });
    }
  },

  async getByAccount(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const result = await TransactionService.getTransactionsByAccount(accountId, page, limit);
      
      res.json({
        message: 'Transactions récupérées avec succès',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des transactions'
      });
    }
  },

  async getMonthlySummary(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      
      const summary = await TransactionService.getMonthlySummary(bureauId, year, month);
      
      res.json({
        message: 'Résumé mensuel récupéré avec succès',
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération du résumé mensuel'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      await TransactionService.deleteTransaction(id, userId);
      
      res.json({
        message: 'Transaction supprimée avec succès'
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la transaction'
      });
    }
  }
};