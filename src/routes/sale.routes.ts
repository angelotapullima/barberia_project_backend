import { Router } from 'express';
import {
  getSalesController,
  getSaleByIdController,
  getSaleByReservationIdController,
} from '../controllers/sale.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

router.get('/', authenticateToken, getSalesController);
router.get('/:id', authenticateToken, getSaleByIdController);
router.get('/by-reservation/:reservationId', authenticateToken, getSaleByReservationIdController);

export default router;
