import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.patch('/bureau', userController.updateBureau);

export default router;
