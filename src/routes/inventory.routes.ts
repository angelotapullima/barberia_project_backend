import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

router.get('/summary', authenticateToken, inventoryController.getInventorySummaryController);
router.get('/movements', authenticateToken, inventoryController.getInventoryMovementsController);
router.post('/movements', authenticateToken, inventoryController.addInventoryMovementController);

export default router;
