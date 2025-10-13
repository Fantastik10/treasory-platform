// backend/src/controllers/reminderController.ts
import { Request, Response } from 'express';
import { ReminderService } from '../services/reminderService';

export class ReminderController {
  private reminderService: ReminderService;

  constructor() {
    this.reminderService = new ReminderService();
  }

  /**
   * Récupère l'historique des relances d'un bureau
   */
  getReminderHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bureauId } = req.params;
      const filters = req.query;
      
      const history = await this.reminderService.getReminderHistory(
        parseInt(bureauId), 
        filters
      );
      
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Met à jour la configuration des relances d'un donateur
   */
  updateReminderConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const { donorId } = req.params;
      const config = req.body;
      
      const updatedDonor = await this.reminderService.updateReminderConfig(
        parseInt(donorId), 
        config
      );
      
      res.json(updatedDonor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Envoie une relance manuelle
   */
  sendManualReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { donorId } = req.params;
      const { message, sujet } = req.body;
      
      // Récupère le donateur
      const donorRepository = AppDataSource.getRepository(Donor);
      const donor = await donorRepository.findOne({
        where: { id: parseInt(donorId) },
        relations: ['bureau']
      });
      
      if (!donor) {
        res.status(404).json({ error: 'Donateur non trouvé' });
        return;
      }
      
      const config = {
        templateEmail: message,
        templateSujet: sujet,
        relanceApresJours: donor.relanceApresJours,
        frequenceRelance: donor.frequenceRelance,
        notifierAdmin: donor.notifierAdmin
      };
      
      const reminder = await this.reminderService.sendReminder(donor, config);
      
      res.json(reminder);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Récupère les statistiques des relances
   */
  getReminderStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bureauId } = req.params;
      
      const history = await this.reminderService.getReminderHistory(parseInt(bureauId));
      
      const stats = {
        total: history.length,
        sent: history.filter(r => r.status === 'sent').length,
        failed: history.filter(r => r.status === 'failed').length,
        last30Days: history.filter(r => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(r.sentAt) >= thirtyDaysAgo;
        }).length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}