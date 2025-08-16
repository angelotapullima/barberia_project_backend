import { Request, Response } from 'express';
import * as barberCommissionsService from '../services/barberCommissions.service';
import dayjs from 'dayjs';

export const calculateMonthlyCommissionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month } = req.body;
    if (!year || !month) {
      res.status(400).json({ message: 'Year and month are required.' });
      return;
    }
    await barberCommissionsService.calculateMonthlyCommissions(year, month);
    res.status(200).json({ message: 'Monthly commissions calculated successfully.' });
  } catch (error) {
    console.error('Error calculating monthly commissions:', error);
    res.status(500).json({ message: 'Error calculating monthly commissions', error });
  }
};

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

export const finalizeBarberPaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const commissionId = parseInt(req.params.commissionId as string, 10);
    if (!commissionId) {
      res.status(400).json({ message: 'Commission ID is required.' });
      return;
    }
    const finalizedPayment = await barberCommissionsService.finalizeBarberPayment(commissionId);
    if (finalizedPayment) {
      res.status(200).json({ message: 'Payment finalized successfully.', payment: finalizedPayment });
    } else {
      res.status(404).json({ message: 'Commission record not found.' });
    }
  } catch (error) {
    console.error('Error finalizing barber payment:', error);
    res.status(500).json({ message: 'Error finalizing barber payment', error });
  }
};

// Keep the old one for now, will be removed later
export const getBarberCommissionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const commissions = await barberCommissionsService.getBarberCommissions();
    res.status(200).json(commissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching barber commissions', error });
  }
};