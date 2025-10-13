// backend/src/controllers/donorController.ts
import { Request, Response } from 'express';
import { DonorService } from '../services/donorService';

export class DonorController {
  private donorService: DonorService;

  constructor() {
    this.donorService = new DonorService();
  }

  createDonor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bureauId } = req.params;
      const donor = await this.donorService.createDonor(req.body, parseInt(bureauId));
      res.status(201).json(donor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  importDonors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bureauId } = req.params;
      const donors = await this.donorService.importDonorsFromExcel(req.body, parseInt(bureauId));
      res.status(201).json(donors);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  getDonors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bureauId } = req.params;
      const filters = req.query;
      const donors = await this.donorService.getDonorsByBureau(parseInt(bureauId), filters);
      res.json(donors);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  updateDonor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const donor = await this.donorService.updateDonor(parseInt(id), req.body);
      res.json(donor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteDonor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.donorService.deleteDonor(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}