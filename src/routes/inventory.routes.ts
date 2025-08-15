import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';

const router = Router();

router.get('/summary', inventoryController.getInventorySummaryController);
router.get('/movements', inventoryController.getInventoryMovementsController);
router.post('/movements', inventoryController.addInventoryMovementController);

export default router;
