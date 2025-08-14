import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';

const router = Router();

router.get('/', serviceController.getAllServices);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

// New routes for inventory management
router.get('/products', serviceController.getProducts);
router.put('/products/:id/stock', serviceController.updateProductStock);
router.get('/products/low-stock', serviceController.getLowStockProducts);
router.get(
  '/products/report/summary',
  serviceController.getInventoryReportSummary,
);

export default router;
