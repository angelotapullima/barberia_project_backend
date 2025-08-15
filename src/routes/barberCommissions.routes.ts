import { Router } from 'express';
import * as barberCommissionsController from '../controllers/barberCommissions.controller';

const router = Router();

router.get('/', barberCommissionsController.getBarberCommissionsController);

export default router;
