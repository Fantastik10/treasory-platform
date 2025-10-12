import { Router } from 'express';
import { espaceController } from '../controllers/espaceController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateData } from '../middleware/validationMiddleware';
import { z } from 'zod';

const router = Router();

const createEspaceSchema = z.object({
  name: z.string().min(1)
});

const updateEspaceSchema = z.object({
  name: z.string().min(1)
});

router.use(authenticateToken);

router.post('/', validateData(createEspaceSchema), espaceController.create);
router.get('/', espaceController.getAll);
router.get('/:id', espaceController.getById);
router.put('/:id', validateData(updateEspaceSchema), espaceController.update);
router.delete('/:id', espaceController.delete);

export default router;