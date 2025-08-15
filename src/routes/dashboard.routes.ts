import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/summary', dashboardController.getDashboardSummary);

export default router;
