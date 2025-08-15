import { Request, Response } from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  completeReservationAndCreateSale,
} from '../services/reservation.service';

export const getAllReservationsController = async (req: Request, res: Response): Promise<void> => {
  const pageNumber = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const includeSaleDetails = req.query.includeSaleDetails === 'true';
  try {
    const { reservations, total, page } = await getAllReservations(
      pageNumber,
      limit,
      includeSaleDetails,
    );
    res.json({ reservations, page, total });
  } catch (error) {
    console.error('Error getting reservations:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getReservationByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reservation = await getReservationById(Number(id));
    if (reservation) {
      res.json(reservation);
    } else {
      res.status(404).json({ message: 'Reservación no encontrada' });
    }
  } catch (error) {
    console.error('Error getting reservation by ID:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createReservationController = async (req: Request, res: Response): Promise<void> => {
  const { barber_id, station_id, client_name, start_time, end_time, service_id } = req.body;
  if (!barber_id || !station_id || !client_name || !start_time || !end_time || !service_id) {
    res.status(400).json({ message: 'Faltan campos requeridos para la reservación.' });
    return;
  }
  try {
    const newReservation = await createReservation(req.body);
    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'No se pudo crear la reservación.' });
  }
};

export const updateReservationController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const updatedReservation = await updateReservation(Number(id), req.body);
    if (!updatedReservation) {
      res.status(404).json({ message: 'Reservación no encontrada' });
      return;
    }
    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'No se pudo actualizar la reservación.' });
  }
};

export const deleteReservationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deleteReservation(Number(id));
    if ('error' in result) {
      res.status(404).json(result);
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const completeReservationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const newSale = await completeReservationAndCreateSale(Number(id));
    res.status(200).json({
      message: 'Reservación completada y venta creada exitosamente',
      sale: newSale,
    });
  } catch (error) {
    console.error('Error completing reservation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
    res.status(500).json({ message: errorMessage });
  }
};