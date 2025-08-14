import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';

const router = Router();

// Specific routes should come before general routes with parameters
router.get('/completed', reservationController.getCompletedReservations);
router.get('/count', reservationController.getReservationCount);
router.get(
  '/count-completed',
  reservationController.getCompletedReservationCount,
);

router.get('/:id', reservationController.getReservationById); // This should come after specific routes
router.get('/', reservationController.getAllReservations);
router.post('/', reservationController.createReservation);
router.put('/:id', reservationController.updateReservation);
router.post('/:id/complete', reservationController.completeReservation); // New route to complete reservation and create sale
router.delete('/:id', reservationController.deleteReservation);

export default router;
