// backend/src/routes/reminderRoutes.ts
import { Router } from 'express';
import { ReminderController } from '../controllers/reminderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const reminderController = new ReminderController();

router.use(authMiddleware);

// Historique et statistiques
router.get('/bureau/:bureauId/reminders/history', reminderController.getReminderHistory);
router.get('/bureau/:bureauId/reminders/stats', reminderController.getReminderStats);

// Configuration
router.put('/donors/:donorId/reminder-config', reminderController.updateReminderConfig);

// Actions manuelles
router.post('/donors/:donorId/remind', reminderController.sendManualReminder);

export default router;