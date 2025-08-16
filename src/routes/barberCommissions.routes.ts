import { Router } from 'express';
import {
  calculateMonthlyCommissionsController,
  getMonthlyBarberCommissionsController,
  getBarberServicesForMonthController,
  getBarberAdvancesForMonthController,
  finalizeBarberPaymentController,
  getBarberCommissionsController, // Keep the old one for now
} from '../controllers/barberCommissions.controller';

const router = Router();

// Calculate monthly commissions (POST request to trigger calculation)
router.post('/calculate-monthly', calculateMonthlyCommissionsController);

// Get monthly commission summary for all barbers
router.get('/monthly-summary', getMonthlyBarberCommissionsController);

// Get detailed services for a barber for a specific month
router.get('/:barberId/services', getBarberServicesForMonthController);

// Get detailed advances for a barber for a specific month
router.get('/:barberId/advances', getBarberAdvancesForMonthController);

// Finalize a barber payment (update status to paid)
router.put('/:commissionId/finalize', finalizeBarberPaymentController);

// Old route (will be removed later)
router.get('/', getBarberCommissionsController);

export default router;