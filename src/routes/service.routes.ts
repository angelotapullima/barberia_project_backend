import { Router } from 'express';
import {
  getAllServicesController,
  getServiceByIdController,
  createServiceController,
  updateServiceController,
  deleteServiceController,
} from '../controllers/service.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

// Rutas para Servicios
router.get('/', authenticateToken, getAllServicesController);
router.get('/:id', authenticateToken, getServiceByIdController);
router.post('/', authenticateToken, createServiceController);
router.put('/:id', authenticateToken, updateServiceController);
router.delete('/:id', authenticateToken, deleteServiceController);

export default router;
