import { Router } from 'express';
import {
  getAllServicesController,
  createServiceController,
  updateServiceController,
  deleteServiceController,
  getProductsController,
  updateProductStockController,
  getLowStockProductsController,
  getInventoryReportSummaryController,
} from '../controllers/service.controller';

const router = Router();

// Rutas para Servicios y Productos (CRUD general)
router.get('/', getAllServicesController);
router.post('/', createServiceController);
router.put('/:id', updateServiceController);
router.delete('/:id', deleteServiceController);

// Rutas específicas para Productos e Inventario
router.get('/products', getProductsController);
router.get('/products/low-stock', getLowStockProductsController);
router.get('/products/report/summary', getInventoryReportSummaryController);
router.put('/products/:id/stock', updateProductStockController);

export default router;