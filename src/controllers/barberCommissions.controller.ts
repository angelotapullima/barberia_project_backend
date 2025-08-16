import { Request, Response } from 'express';
import * as barberCommissionsService from '../services/barberCommissions.service';

export const getMonthlyBarberCommissionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);
    if (!year || !month) {
      res.status(400).json({ message: 'Year and month are required query parameters.' });
      return;
    }
    const commissions = await barberCommissionsService.getMonthlyBarberCommissions(year, month);
    res.status(200).json(commissions);
  } catch (error) {
    console.error('Error fetching monthly barber commissions:', error);
    res.status(500).json({ message: 'Error fetching monthly barber commissions', error });
  }
};

export const createAndFinalizePaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barberId, year, month } = req.body;
    if (!barberId || !year || !month) {
      res.status(400).json({ message: 'barberId, year, and month are required.' });
      return;
    }
    const newPayment = await barberCommissionsService.createAndFinalizePayment(barberId, year, month);
    res.status(201).json({ message: 'Payment created and finalized successfully.', payment: newPayment });
  } catch (error) {
    const err = error as Error;
    console.error('Error creating and finalizing payment:', err.message);

    if (err.message.includes('already been registered')) {
      res.status(409).json({ message: err.message }); // 409 Conflict
    } else if (err.message.includes('period has not ended')) {
      res.status(403).json({ message: err.message }); // 403 Forbidden
    } else {
      res.status(500).json({ message: 'Error creating and finalizing payment', error: err.message });
    }
  }
};

export const getBarberServicesForMonthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const barberId = parseInt(req.params.barberId as string, 10);
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);
    if (!barberId || !year || !month) {
      res.status(400).json({ message: 'Barber ID, year, and month are required.' });
      return;
    }
    const services = await barberCommissionsService.getBarberServicesForMonth(barberId, year, month);
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching barber services for month:', error);
    res.status(500).json({ message: 'Error fetching barber services for month', error });
  }
};

export const getBarberAdvancesForMonthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const barberId = parseInt(req.params.barberId as string, 10);
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);
    if (!barberId || !year || !month) {
      res.status(400).json({ message: 'Barber ID, year, and month are required.' });
      return;
    }
    const advances = await barberCommissionsService.getBarberAdvancesForMonth(barberId, year, month);
    res.status(200).json(advances);
  } catch (error) {
    console.error('Error fetching barber advances for month:', error);
    res.status(500).json({ message: 'Error fetching barber advances for month', error });
  }
};
