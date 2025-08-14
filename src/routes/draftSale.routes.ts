import { Router } from 'express';
import { draftSaleController } from '../controllers/draftSale.controller';

const router = Router();

router.post('/', draftSaleController.saveDraftSale); // For creating/updating a draft
router.get('/:reservationId', draftSaleController.getDraftSale);
router.delete('/:reservationId', draftSaleController.deleteDraftSale);

export default router;
