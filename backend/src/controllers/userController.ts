import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export const userController = {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.json({
        message: 'User profile retrieved successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve user profile'
      });
    }
  },

  async updateBureau(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { bureauId } = req.body;
      
      if (!bureauId) {
        res.status(400).json({ error: 'Bureau ID is required' });
        return;
      }
      
      const user = await UserService.updateUserBureau(userId, bureauId);
      
      res.json({
        message: 'User bureau updated successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update user bureau'
      });
    }
  }
};