import { Router } from 'express';
import { barberController } from '../controllers/barber.controller';

const router = Router();

router.get('/', barberController.getAllBarbers);
router.post('/', barberController.createBarber);
router.put('/:id', barberController.updateBarber);
router.delete('/:id', barberController.deleteBarber);

export default router;
