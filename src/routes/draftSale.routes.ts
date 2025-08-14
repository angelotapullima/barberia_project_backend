import { Router } from 'express';
import {
  saveDraftSaleController,
  getDraftSaleController,
  deleteDraftSaleController,
} from '../controllers/draftSale.controller';

const router = Router();

router.post('/', saveDraftSaleController);
router.get('/:reservationId', getDraftSaleController);
router.delete('/:reservationId', deleteDraftSaleController);

export default router;