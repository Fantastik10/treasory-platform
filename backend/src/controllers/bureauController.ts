import { Request, Response } from 'express';
import { BureauService } from '../services/bureauService';
import { z } from 'zod';

const createBureauSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  color: z.string().min(1, 'La couleur est requise'),
  country: z.string().min(1, 'Le pays est requis'),
  espaceTravailId: z.string().uuid('ID espace de travail invalide')
});

const updateBureauSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  country: z.string().min(1).optional()
});

export const bureauController = {
  async create(req: Request, res: Response) {
    try {
      const data = createBureauSchema.parse(req.body);
      const bureau = await BureauService.createBureau(data);
      
      res.status(201).json({
        message: 'Bureau créé avec succès',
        data: bureau
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la création du bureau'
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bureau = await BureauService.getBureauById(id);
      
      if (!bureau) {
        res.status(404).json({ error: 'Bureau non trouvé' });
        return;
      }
      
      res.json({
        message: 'Bureau récupéré avec succès',
        data: bureau
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération du bureau'
      });
    }
  },

  async getByEspace(req: Request, res: Response) {
    try {
      const { espaceId } = req.params;
      const bureaux = await BureauService.getBureauxByEspace(espaceId);
      
      res.json({
        message: 'Bureaux récupérés avec succès',
        data: bureaux
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des bureaux'
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateBureauSchema.parse(req.body);
      const bureau = await BureauService.updateBureau(id, data);
      
      res.json({
        message: 'Bureau mis à jour avec succès',
        data: bureau
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du bureau'
      });
    }
  },

  async updateColor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { color } = req.body;
      
      if (!color) {
        res.status(400).json({ error: 'La couleur est requise' });
        return;
      }
      
      const bureau = await BureauService.updateBureauColor(id, color);
      
      res.json({
        message: 'Couleur du bureau mise à jour avec succès',
        data: bureau
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la couleur'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await BureauService.deleteBureau(id);
      
      res.json({
        message: 'Bureau supprimé avec succès'
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du bureau'
      });
    }
  }
};