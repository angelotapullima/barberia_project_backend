import { Router } from 'express';
import {
  getMonthlyBarberCommissionsController,
  getBarberServicesForMonthController,
  getBarberAdvancesForMonthController,
  createAndFinalizePaymentController,
} from '../controllers/barberCommissions.controller';

const router = Router();

// Get the live-calculated monthly commission summary for all barbers
router.get('/monthly-summary', getMonthlyBarberCommissionsController);

// Create and finalize a barber's payment for a specific period
router.post('/finalize-payment', createAndFinalizePaymentController);

// Get detailed services for a barber for a specific month
router.get('/:barberId/services', getBarberServicesForMonthController);

// Get detailed advances for a barber for a specific month
router.get('/:barberId/advances', getBarberAdvancesForMonthController);

export default router;
