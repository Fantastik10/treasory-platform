import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export const notificationController = {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await NotificationService.getUserNotifications(userId, page, limit);
      
      res.json({
        message: 'Notifications récupérées avec succès',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des notifications'
      });
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      const notification = await NotificationService.markAsRead(id, userId);
      
      res.json({
        message: 'Notification marquée comme lue',
        data: notification
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erreur lors du marquage de la notification'
      });
    }
  },

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      await NotificationService.markAllAsRead(userId);
      
      res.json({
        message: 'Toutes les notifications marquées comme lues'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors du marquage des notifications'
      });
    }
  },

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      const count = await NotificationService.getUnreadCount(userId);
      
      res.json({
        message: 'Nombre de notifications non lues récupéré',
        data: { unreadCount: count }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors du comptage des notifications'
      });
    }
  }
};