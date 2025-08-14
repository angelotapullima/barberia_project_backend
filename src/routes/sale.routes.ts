import { Router } from 'express';
import {
  getSalesController,
  getSaleByIdController,
  createSaleController,
  getSaleByReservationIdController,
} from '../controllers/sale.controller';

const router = Router();

router.get('/', getSalesController);
router.post('/', createSaleController);

// Es importante que las rutas más específicas vayan antes de las que tienen parámetros dinámicos
router.get('/by-reservation/:reservationId', getSaleByReservationIdController);
router.get('/:id', getSaleByIdController);

export default router;