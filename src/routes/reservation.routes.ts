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

const router = Router();

// Aggregated view data
router.get('/view/calendar', getCalendarViewDataController);
router.post('/fix-end-times', fixReservationEndTimesController);

// Basic CRUD
router.get('/', getAllReservationsController);
router.get('/:id', getReservationByIdController);
router.post('/', createReservationController);
router.put('/:id', updateReservationController);
router.delete('/:id', deleteReservationController);

// Complete reservation and create sale
router.post('/:id/complete', completeReservationController);

// Add/remove products from an active reservation
router.post('/:id/products', addProductToReservationController);
router.delete('/:id/products/:reservationProductId', removeProductFromReservationController);

export default router;
