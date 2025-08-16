import { Router } from 'express';
import {
  getAllBarbersController,
  getBarberByIdController,
  createBarberController,
  updateBarberController,
  deleteBarberController,
  createBarberAdvanceController,
} from '../controllers/barber.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

// La ruta de disponibilidad debe ir antes de la ruta con el parámetro :id
// para evitar que 'availability' sea tratado como un id.


router.get('/', authenticateToken, getAllBarbersController);
router.get('/:id', authenticateToken, getBarberByIdController);
router.post('/', authenticateToken, createBarberController);
router.put('/:id', authenticateToken, updateBarberController);
router.delete('/:id', authenticateToken, deleteBarberController);
router.post('/:id/advances', authenticateToken, createBarberAdvanceController);

export default router;