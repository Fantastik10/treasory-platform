import { Request, Response } from 'express';
import { MessageService } from '../services/messageService';
import { z } from 'zod';

const createMessageSchema = z.object({
  content: z.string().min(1, 'Le contenu est requis'),
  bureauId: z.string().uuid('ID bureau invalide')
});

export const messageController = {
  async create(req: Request, res: Response) {
    try {
      const { content, bureauId } = createMessageSchema.parse(req.body);
      const userId = (req as any).user.userId;
      
      const message = await MessageService.createMessage({
        content,
        authorId: userId,
        bureauId
      });
      
      res.status(201).json({
        message: 'Message envoyé avec succès',
        data: message
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message'
      });
    }
  },

  async getByBureau(req: Request, res: Response) {
    try {
      const { bureauId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const result = await MessageService.getMessagesByBureau(bureauId, page, limit);
      
      res.json({
        message: 'Messages récupérés avec succès',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des messages'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      await MessageService.deleteMessage(id, userId);
      
      res.json({
        message: 'Message supprimé avec succès'
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du message'
      });
    }
  }
};