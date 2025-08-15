import { Router } from 'express';
import * as posController from '../controllers/pos.controller';

const router = Router();

router.get('/master-data', posController.getPosMasterData);

export default router;
