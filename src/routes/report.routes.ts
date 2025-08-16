import { Router } from 'express';
import {
  getComprehensiveSalesReportController,
  getServicesProductsSalesReportController,
  getStationUsageReportController,
  getCustomerFrequencyReportController,
  getPeakHoursReportController,
  getDetailedBarberServiceSalesReportController,
} from '../controllers/report.controller';

const router = Router();

router.get('/comprehensive-sales', getComprehensiveSalesReportController);
router.get('/services-products-sales', getServicesProductsSalesReportController);
router.get('/station-usage', getStationUsageReportController);
router.get('/customer-frequency', getCustomerFrequencyReportController);
router.get('/peak-hours', getPeakHoursReportController);
router.get('/detailed-barber-service-sales', getDetailedBarberServiceSalesReportController);

export default router;