import { Router } from 'express';
import { financialController } from '../controllers/financialController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/bureau/:bureauId/balance', financialController.getGlobalBalance);
router.get('/bureau/:bureauId/overview', financialController.getOverview);
router.get('/bureau/:bureauId/monthly-evolution', financialController.getMonthlyEvolution);
router.get('/bureau/:bureauId/yearly-summary', financialController.getYearlySummary);
router.get('/bureau/:bureauId/export', financialController.exportData);

export default router;