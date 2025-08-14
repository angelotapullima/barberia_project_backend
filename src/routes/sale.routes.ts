import { Router } from 'express';
import { saleController } from '../controllers/sale.controller';

const router = Router();

router.get('/', saleController.getAllSales);
router.get('/filtered', saleController.getSalesFiltered); // New route for filtered sales
router.post('/', saleController.createSale);
router.get(
  '/by-reservation/:reservationId',
  saleController.getSaleByReservationId,
);

router.get('/summary', saleController.getDailySalesSummary);
router.get('/summary-by-service', saleController.getSalesSummaryByService);
router.get(
  '/summary-by-payment-method',
  saleController.getSalesSummaryByPaymentMethod,
);

router.get(
  '/daily-by-type',
  saleController.getDailySalesByTypeReport,
);

export default router;
