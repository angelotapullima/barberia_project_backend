import { Request, Response } from 'express';
import {
  getAllBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
  getBarberAvailability
} from '../services/barber.service';

export const getAllBarbersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const barbers = await getAllBarbers();
    res.json(barbers);
  } catch (error) {
    console.error('Error getting barbers:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getBarberByIdController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const barber = await getBarberById(Number(id));
        if (barber) {
            res.json(barber);
        } else {
            res.status(404).json({ message: 'Barbero no encontrado' });
        }
    } catch (error) {
        console.error(`Error getting barber ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const createBarberController = async (req: Request, res: Response): Promise<void> => {
  try {
    const newBarber = await createBarber(req.body);
    res.status(201).json(newBarber);
  } catch (error) {
    console.error('Error creating barber:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateBarberController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const updatedBarber = await updateBarber(Number(id), req.body);
    if (!updatedBarber) {
      res.status(404).json({ message: 'Barbero no encontrado' });
      return;
    }
    res.status(200).json(updatedBarber);
  } catch (error) {
    console.error('Error updating barber:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteBarberController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await deleteBarber(Number(id));
    if (result.message === 'Barber not found') {
        res.status(404).json(result);
    } else if (result.message === 'Barber deleted successfully') {
        res.status(204).send();
    } else {
        // Handle other potential error messages from the service
        res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error deleting barber:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getBarberAvailabilityController = async (req: Request, res: Response): Promise<void> => {
    const { barberId, date } = req.query;
    if (!barberId || !date) {
        res.status(400).json({ message: 'Los parámetros barberId y date son requeridos.' });
        return;
    }
    try {
        const availability = await getBarberAvailability(Number(barberId), date as string);
        res.json(availability);
    } catch (error) {
        console.error('Error getting barber availability:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};