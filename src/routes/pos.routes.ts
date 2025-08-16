import { Router } from 'express';
import * as posController from '../controllers/pos.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

router.get('/master-data', authenticateToken, posController.getPosMasterData);

export default router;
