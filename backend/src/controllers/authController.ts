import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN_1', 'ADMIN_2', 'ADMIN_3', 'USER']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, role } = registerSchema.parse(req.body);
      
      const result = await AuthService.registerUser(email, password, role);
      
      res.status(201).json({
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const result = await AuthService.loginUser(email, password);
      
      res.json({
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      // req.user est ajouté par le middleware d'authentification
      const user = (req as any).user;
      
      res.json({
        message: 'Profile retrieved successfully',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve profile'
      });
    }
  }
};