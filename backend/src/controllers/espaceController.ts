import { Request, Response } from 'express';
import { EspaceService } from '../services/espaceService';
import { z } from 'zod';

const createEspaceSchema = z.object({
  name: z.string().min(1, 'Le nom est requis')
});

const updateEspaceSchema = z.object({
  name: z.string().min(1, 'Le nom est requis')
});

export const espaceController = {
  async create(req: Request, res: Response) {
    try {
      const { name } = createEspaceSchema.parse(req.body);
      const userId = (req as any).user.userId;
      
      const espace = await EspaceService.createEspace({
        name,
        createdBy: userId
      });
      
      res.status(201).json({
        message: 'Espace de travail créé avec succès',
        data: espace
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'espace'
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const espace = await EspaceService.getEspaceById(id);
      
      if (!espace) {
        res.status(404).json({ error: 'Espace de travail non trouvé' });
        return;
      }
      
      res.json({
        message: 'Espace de travail récupéré avec succès',
        data: espace
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération de l\'espace'
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const espaces = await EspaceService.getAllEspaces();
      
      res.json({
        message: 'Espaces de travail récupérés avec succès',
        data: espaces
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des espaces'
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = updateEspaceSchema.parse(req.body);
      const espace = await EspaceService.updateEspace(id, name);
      
      res.json({
        message: 'Espace de travail mis à jour avec succès',
        data: espace
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'espace'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await EspaceService.deleteEspace(id);
      
      res.json({
        message: 'Espace de travail supprimé avec succès'
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'espace'
      });
    }
  }
};