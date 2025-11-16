import { Router } from 'express';
import { AccountController } from '../controllers/accountController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateData } from '../middleware/validationMiddleware';
import { z } from 'zod';

const router = Router();
const accountController = new AccountController();

const createAccountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['BANQUE', 'PAYPAL', 'CAISSE', 'MOBILE_MONEY', 'OTHER']),
  balance: z.number().min(0),
  currency: z.string().min(1),
  bureauId: z.string().uuid()
});

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  balance: z.number().min(0).optional(),
  currency: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

router.use(authenticateToken);

router.post('/', validateData(createAccountSchema), accountController.create);
router.get('/bureau/:bureauId', accountController.getByBureau);
router.get('/bureau/:bureauId/summary', accountController.getSummary);
router.get('/:id', accountController.getById);
router.put('/:id', validateData(updateAccountSchema), accountController.update);
router.patch('/:id/balance', accountController.updateBalance);
router.delete('/:id', accountController.delete);

export default router;