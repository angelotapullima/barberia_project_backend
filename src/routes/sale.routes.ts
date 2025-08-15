import { Router } from 'express';
import {
  getSalesController,
  getSaleByIdController,
  createSaleController,
  getSaleByReservationIdController,
  getSalesSummaryController, // Import the new controller
  getSalesSummaryByServiceController, // Import the new controller
} from '../controllers/sale.controller';

const router = Router();

router.get('/', getSalesController);
router.post('/', createSaleController);

// Add new specific routes before dynamic :id route
router.get('/summary', getSalesSummaryController); // New route
router.get('/summary-by-service', getSalesSummaryByServiceController); // New route

// Es importante que las rutas más específicas vayan antes de las que tienen parámetros dinámicos
router.get('/by-reservation/:reservationId', getSaleByReservationIdController);
router.get('/:id', getSaleByIdController);

export default router;