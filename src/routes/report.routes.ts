import { Router } from 'express';
import { reportController } from '../controllers/report.controller';

const router = Router();

router.get('/', reportController.getReport);
router.get(
  '/comprehensive-sales',
  reportController.getComprehensiveSalesReport,
);
router.get(
  '/services-products-sales',
  reportController.getServicesProductsSalesReport,
);

// Rutas para los nuevos reportes
router.get('/station-usage', reportController.getStationUsageReport);
router.get('/customer-frequency', reportController.getCustomerFrequencyReport);
router.get('/peak-hours', reportController.getPeakHoursReport);

router.get('/barber-payments', reportController.getBarberPaymentsReport);

router.get('/detailed-barber-service-sales', reportController.getDetailedBarberServiceSales);

export default router;
