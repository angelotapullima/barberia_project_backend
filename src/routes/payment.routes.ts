import { Router } from 'express';
import {
  getAllPaymentsController,
  updatePaymentController,
} from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

router.get('/', authenticateToken, getAllPaymentsController);
router.put('/:id', authenticateToken, updatePaymentController);

export default router;