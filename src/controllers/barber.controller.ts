import { Request, Response } from 'express';
import * as barberService from '../services/barber.service';

export const getAllBarbersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const barbers = await barberService.getAllBarbers();
    res.status(200).json(barbers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching barbers', error });
  }
};

export const getBarberByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const barber = await barberService.getBarberById(id);
    if (barber) {
      res.status(200).json(barber);
    } else {
      res.status(404).json({ message: 'Barber not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching barber', error });
  }
};

export const createBarberController = async (req: Request, res: Response): Promise<void> => {
  try {
    const newBarber = await barberService.createBarber(req.body);
    res.status(201).json(newBarber);
  } catch (error) {
    res.status(500).json({ message: 'Error creating barber', error });
  }
};

export const updateBarberController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedBarber = await barberService.updateBarber(id, req.body);
    if (updatedBarber) {
      res.status(200).json(updatedBarber);
    } else {
      res.status(404).json({ message: 'Barber not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating barber', error });
  }
};

export const deleteBarberController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await barberService.deleteBarber(id);
    if (result) { // If result is not null, it means the barber was found and soft-deleted
        res.status(200).json({ message: 'Barber deactivated successfully' });
    } else { // If result is null, the barber was not found
        res.status(404).json({ message: 'Barber not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating barber', error });
  }
};

export const createBarberAdvanceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const barberId = parseInt(req.params.id, 10);
    const { amount, date, notes } = req.body;
    const newAdvance = await barberService.createBarberAdvance(barberId, amount, date, notes);
    res.status(201).json(newAdvance);
  } catch (error) {
    res.status(500).json({ message: 'Error creating barber advance', error });
  }
};