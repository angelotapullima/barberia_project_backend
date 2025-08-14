import { Router } from 'express';
import { stationController } from '../controllers/station.controller';

const router = Router();

router.get('/', stationController.getAllStations);
router.post('/', stationController.createStation);
router.put('/:id', stationController.updateStation);
router.delete('/:id', stationController.deleteStation);

export default router;
