import { Router } from 'express';
import { syncController } from '../controllers/syncController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateData } from '../middleware/validationMiddleware';
import { z } from 'zod';

const router = Router();

const testConnectionSchema = z.object({
  connectionType: z.string(),
  credentials: z.record(z.any())
});

const excelSyncSchema = z.object({
  filePath: z.string(),
  accountId: z.string().uuid()
});

router.use(authenticateToken);

router.post('/test-connection', validateData(testConnectionSchema), syncController.testConnection);
router.post('/connection/:connectionId/sync', syncController.syncConnection);
router.get('/connection/:connectionId/status', syncController.getConnectionStatus);
router.get('/connection/:connectionId/logs', syncController.getSyncLogs);
router.post('/bureau/:bureauId/excel-sync', validateData(excelSyncSchema), syncController.setupExcelSync);
router.get('/excel-template', syncController.generateExcelTemplate);

export default router;