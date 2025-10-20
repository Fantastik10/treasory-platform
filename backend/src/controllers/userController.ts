import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export const userController = {
 async getAllUsers(req: Request, res: Response) {
  try {
    const users = await UserService.getAllUsers();
      console.log('Users retrieved successfully:', users);
      res.status(200).json({
        message: 'Users retrieved successfully',
        data: users
      });
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({
        error: 'Failed to retrieve users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

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