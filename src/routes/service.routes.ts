import { Router } from 'express';
import {
  getAllServicesController,
  getServiceByIdController,
  createServiceController,
  updateServiceController,
  deleteServiceController,
} from '../controllers/service.controller';

const router = Router();

// Rutas para Servicios
router.get('/', getAllServicesController);
router.get('/:id', getServiceByIdController);
router.post('/', createServiceController);
router.put('/:id', updateServiceController);
router.delete('/:id', deleteServiceController);

export default router;
