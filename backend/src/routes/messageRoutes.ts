import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateData } from '../middleware/validationMiddleware';
import { z } from 'zod';

const router = Router();

const createMessageSchema = z.object({
  content: z.string().min(1),
  bureauId: z.string().uuid()
});

router.use(authenticateToken);

router.post('/', validateData(createMessageSchema), messageController.create);
router.get('/bureau/:bureauId', messageController.getByBureau);
router.delete('/:id', messageController.delete);

export default router;