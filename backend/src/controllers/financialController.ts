import { Request, Response } from 'express';
import { FinancialService } from '../services/financialService';
import { ExportService } from '../services/exportService';
import { z } from 'zod';

const exportSchema = z.object({
  format: z.enum(['excel', 'pdf', 'csv']).default('excel'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(['ENTREE', 'SORTIE']).optional()
});

export const financialController = {
  async getGlobalBalance(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const balance = await FinancialService.getGlobalBalance(bureauId);
      
      res.json({
        message: 'Solde global récupéré avec succès',
        data: balance
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération du solde global'
      });
    }
  },

  async getOverview(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const overview = await FinancialService.getFinancialOverview(bureauId);
      
      res.json({
        message: 'Aperçu financier récupéré avec succès',
        data: overview
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération de l\'aperçu financier'
      });
    }
  },

  async getMonthlyEvolution(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const months = parseInt(req.query.months as string) || 6;
      
      const evolution = await FinancialService.getMonthlyEvolution(bureauId, months);
      
      res.json({
        message: 'Évolution mensuelle récupérée avec succès',
        data: evolution
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération de l\'évolution mensuelle'
      });
    }
  },

  async getYearlySummary(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      const summary = await FinancialService.getYearlySummary(bureauId, year);
      
      res.json({
        message: 'Résumé annuel récupéré avec succès',
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération du résumé annuel'
      });
    }
  },

  async exportData(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const config = exportSchema.parse(req.query);
      
      const filters = {
        startDate: config.startDate,
        endDate: config.endDate,
        type: config.type
      };

      switch (config.format) {
        case 'excel':
          await ExportService.exportToExcel(bureauId, res, filters);
          break;
        case 'pdf':
          await ExportService.exportToPDF(bureauId, res);
          break;
        default:
          res.status(400).json({ error: 'Format d\'export non supporté' });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de l\'export des données'
      });
    }
  }
};