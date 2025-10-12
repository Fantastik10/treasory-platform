import { Router } from 'express';
import { bureauController } from '../controllers/bureauController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateData } from '../middleware/validationMiddleware';
import { z } from 'zod';

const router = Router();

const createBureauSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  country: z.string().min(1),
  espaceTravailId: z.string().uuid()
});

const updateBureauSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  country: z.string().min(1).optional()
});

router.use(authenticateToken);

router.post('/', validateData(createBureauSchema), bureauController.create);
router.get('/espace/:espaceId', bureauController.getByEspace);
router.get('/:id', bureauController.getById);
router.put('/:id', validateData(updateBureauSchema), bureauController.update);
router.patch('/:id/color', bureauController.updateColor);
router.delete('/:id', bureauController.delete);

export default router;