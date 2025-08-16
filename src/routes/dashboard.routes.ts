import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Import the middleware

const router = Router();

router.get('/summary', authenticateToken, dashboardController.getDashboardSummary); // Apply the middleware

export default router;
