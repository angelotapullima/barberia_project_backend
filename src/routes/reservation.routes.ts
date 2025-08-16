import { Router } from 'express';
import {
  getAllReservationsController,
  getReservationByIdController,
  createReservationController,
  updateReservationController,
  deleteReservationController,
  completeReservationController,
  addProductToReservationController,
  removeProductFromReservationController,
  getCalendarViewDataController,
  fixReservationEndTimesController,
} from '../controllers/reservation.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

// Aggregated view data
router.get('/view/calendar', authenticateToken, getCalendarViewDataController);
router.post('/fix-end-times', authenticateToken, fixReservationEndTimesController);

// Basic CRUD
router.get('/', authenticateToken, getAllReservationsController);
router.get('/:id', authenticateToken, getReservationByIdController);
router.post('/', authenticateToken, createReservationController);
router.put('/:id', authenticateToken, updateReservationController);
router.delete('/:id', authenticateToken, deleteReservationController);

// Complete reservation and create sale
router.post('/:id/complete', authenticateToken, completeReservationController);

// Add/remove products from an active reservation
router.post('/:id/products', authenticateToken, addProductToReservationController);
router.delete('/:id/products/:reservationProductId', authenticateToken, removeProductFromReservationController);

export default router;
