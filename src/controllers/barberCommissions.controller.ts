import { Request, Response } from 'express';
import * as barberCommissionsService from '../services/barberCommissions.service';

export const getBarberCommissionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const commissions = await barberCommissionsService.getBarberCommissions();
    res.status(200).json(commissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching barber commissions', error });
  }
};
