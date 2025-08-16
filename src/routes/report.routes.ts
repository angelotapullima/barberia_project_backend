import { Router } from 'express';
import {
  getComprehensiveSalesReportController,
  getServicesProductsSalesReportController,
  getStationUsageReportController,
  getCustomerFrequencyReportController,
  getPeakHoursReportController,
  getDetailedBarberServiceSalesReportController,
} from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

router.get('/comprehensive-sales', authenticateToken, getComprehensiveSalesReportController);
router.get('/services-products-sales', authenticateToken, getServicesProductsSalesReportController);
router.get('/station-usage', authenticateToken, getStationUsageReportController);
router.get('/customer-frequency', authenticateToken, getCustomerFrequencyReportController);
router.get('/peak-hours', authenticateToken, getPeakHoursReportController);
router.get('/detailed-barber-service-sales', authenticateToken, getDetailedBarberServiceSalesReportController);

export default router;