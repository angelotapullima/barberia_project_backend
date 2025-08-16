import { Router } from 'express';
import {
  getAllStationsController,
  createStationController,
  updateStationController,
  deleteStationController,
} from '../controllers/station.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

router.get('/', authenticateToken, getAllStationsController);
router.post('/', authenticateToken, createStationController);
router.put('/:id', authenticateToken, updateStationController);
router.delete('/:id', authenticateToken, deleteStationController);

export default router;