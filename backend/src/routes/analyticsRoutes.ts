import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// Statistiques dashboard
router.get('/bureau/:bureauId/dashboard-stats', analyticsController.getDashboardStats);

// Données de graphiques
router.get('/bureau/:bureauId/charts/income-expense', analyticsController.getIncomeExpenseChart);
router.get('/bureau/:bureauId/charts/account-distribution', analyticsController.getAccountDistributionChart);
router.get('/bureau/:bureauId/charts/categories', analyticsController.getCategoryChart);
router.get('/bureau/:bureauId/charts/cash-flow-forecast', analyticsController.getCashFlowForecast);
router.get('/bureau/:bureauId/charts/transaction-trends', analyticsController.getTransactionTrends);
router.get('/bureau/:bureauId/charts/category-analysis', analyticsController.getCategoryAnalysis);
router.get('/bureau/:bureauId/charts/monthly-comparison', analyticsController.getMonthlyComparison);
router.get('/bureau/:bureauId/charts/account-performance', analyticsController.getAccountPerformance);

// Génération de rapports
router.get('/bureau/:bureauId/reports/financial', analyticsController.generateFinancialReport);
router.get('/bureau/:bureauId/reports/analytics', analyticsController.generateAnalyticsReport);

export default router;