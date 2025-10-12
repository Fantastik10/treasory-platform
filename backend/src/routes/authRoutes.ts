import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateData } from '../middleware/validationMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN_1', 'ADMIN_2', 'ADMIN_3', 'USER']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Public routes
router.post('/register', validateData(registerSchema), authController.register);
router.post('/login', validateData(loginSchema), authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

export default router;