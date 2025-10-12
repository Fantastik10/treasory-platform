import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateData } from '../middleware/validationMiddleware';
import { z } from 'zod';

const router = Router();

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['ENTREE', 'SORTIE']),
  description: z.string().min(1),
  category: z.string().optional(),
  date: z.string(),
  accountId: z.string().uuid(),
  bureauId: z.string().uuid()
});

router.use(authenticateToken);

router.post('/', validateData(createTransactionSchema), transactionController.create);
router.get('/bureau/:bureauId', transactionController.getByBureau);
router.get('/account/:accountId', transactionController.getByAccount);
router.get('/bureau/:bureauId/monthly-summary', transactionController.getMonthlySummary);
router.get('/:id', transactionController.getById);
router.delete('/:id', transactionController.delete);

export default router;