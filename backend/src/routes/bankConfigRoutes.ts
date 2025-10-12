import { Router } from 'express';
import { bankConfigController } from '../controllers/bankConfigController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateData } from '../middleware/validationMiddleware';
import { z } from 'zod';

const router = Router();

const createConnectionSchema = z.object({
  bankName: z.string().min(1),
  connectionType: z.string(),
  country: z.string().min(1),
  credentials: z.record(z.any()),
  syncConfig: z.object({
    frequency: z.string().optional(),
    autoSync: z.boolean().optional(),
    syncTransactions: z.boolean().optional(),
    syncBalance: z.boolean().optional()
  }).optional()
});

const updateConnectionSchema = z.object({
  bankName: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  credentials: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
  syncConfig: z.object({
    frequency: z.string().optional(),
    autoSync: z.boolean().optional(),
    syncTransactions: z.boolean().optional(),
    syncBalance: z.boolean().optional()
  }).optional()
});

router.use(authenticateToken);

router.post('/bureau/:bureauId/connections', validateData(createConnectionSchema), bankConfigController.createConnection);
router.get('/bureau/:bureauId/connections', bankConfigController.getBureauConnections);
router.get('/connections/:connectionId', bankConfigController.getConnection);
router.put('/connections/:connectionId', validateData(updateConnectionSchema), bankConfigController.updateConnection);
router.delete('/connections/:connectionId', bankConfigController.deleteConnection);
router.get('/supported-banks/:countryCode', bankConfigController.getSupportedBanks);

export default router;