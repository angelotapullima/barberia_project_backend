import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await dashboardService.getDashboardSummary();
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard summary', error });
  }
};
