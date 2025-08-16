import { Router } from 'express';
import {
  getMonthlyBarberCommissionsController,
  getBarberServicesForMonthController,
  getBarberAdvancesForMonthController,
  createAndFinalizePaymentController,
} from '../controllers/barberCommissions.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

// Get the live-calculated monthly commission summary for all barbers
router.get('/monthly-summary', authenticateToken, getMonthlyBarberCommissionsController);

// Create and finalize a barber's payment for a specific period
router.post('/finalize-payment', authenticateToken, createAndFinalizePaymentController);

// Get detailed services for a barber for a specific month
router.get('/:barberId/services', authenticateToken, getBarberServicesForMonthController);

// Get detailed advances for a barber for a specific month
router.get('/:barberId/advances', authenticateToken, getBarberAdvancesForMonthController);

export default router;
