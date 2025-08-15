import { Router } from 'express';
import {
  getAllBarbersController,
  getBarberByIdController,
  createBarberController,
  updateBarberController,
  deleteBarberController,
} from '../controllers/barber.controller';

const router = Router();

// La ruta de disponibilidad debe ir antes de la ruta con el parámetro :id
// para evitar que 'availability' sea tratado como un id.


router.get('/', getAllBarbersController);
router.get('/:id', getBarberByIdController);
router.post('/', createBarberController);
router.put('/:id', updateBarberController);
router.delete('/:id', deleteBarberController);

export default router;