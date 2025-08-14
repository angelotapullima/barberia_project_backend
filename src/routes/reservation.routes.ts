import { Router } from 'express';
import {
  getAllReservationsController,
  getReservationByIdController,
  createReservationController,
  updateReservationController,
  deleteReservationController,
  completeReservationController,
} from '../controllers/reservation.controller';

const router = Router();

// Rutas para el CRUD de reservaciones
router.get('/', getAllReservationsController);
router.get('/:id', getReservationByIdController);
router.post('/', createReservationController);
router.put('/:id', updateReservationController);
router.delete('/:id', deleteReservationController);

// Ruta para marcar una reservación como completada y generar la venta
router.post('/:id/complete', completeReservationController);

export default router;