import { Router } from 'express';
import {
  getAllPaymentsController,
  updatePaymentController,
} from '../controllers/payment.controller';

const router = Router();

router.get('/', getAllPaymentsController);
router.put('/:id', updatePaymentController);

export default router;