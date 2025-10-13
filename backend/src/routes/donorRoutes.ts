// backend/src/routes/donorRoutes.ts
import { Router } from 'express';
import { DonorController } from '../controllers/donorController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const donorController = new DonorController();

router.use(authMiddleware);

router.post('/bureau/:bureauId/donors', donorController.createDonor);
router.post('/bureau/:bureauId/donors/import', donorController.importDonors);
router.get('/bureau/:bureauId/donors', donorController.getDonors);
router.put('/donors/:id', donorController.updateDonor);
router.delete('/donors/:id', donorController.deleteDonor);

export default router;