import { Router } from 'express';
import {
  getAllStationsController,
  createStationController,
  updateStationController,
  deleteStationController,
} from '../controllers/station.controller';

const router = Router();

router.get('/', getAllStationsController);
router.post('/', createStationController);
router.put('/:id', updateStationController);
router.delete('/:id', deleteStationController);

export default router;