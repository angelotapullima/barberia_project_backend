import { Router } from 'express';
import {
  getSalesController,
  getSaleByIdController,
  getSaleByReservationIdController,
} from '../controllers/sale.controller';

const router = Router();

router.get('/', getSalesController);
router.get('/:id', getSaleByIdController);
router.get('/by-reservation/:reservationId', getSaleByReservationIdController);

export default router;
