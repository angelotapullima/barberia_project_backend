import { Request, Response } from 'express';
import { reservationService } from '../services/reservation.service';

class ReservationController {
  async getAllReservations(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    try {
      const reservations = await reservationService.getAllReservations(
        startDate as string,
        endDate as string,
      );
      res.json(reservations);
    } catch (error) {
      console.error('Error getting reservations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getReservationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reservation = await reservationService.getReservationById(
        Number(id),
      );
      if (reservation) {
        res.json(reservation);
      } else {
        res.status(404).json({ error: 'Reservation not found' });
      }
    } catch (error) {
      console.error('Error getting reservation by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createReservation(req: Request, res: Response): Promise<void> {
    const {
      barber_id,
      station_id,
      client_name,
      client_phone,
      client_email,
      start_time,
      end_time,
      service_id,
      notes,
    } = req.body; // Added station_id

    if (
      !barber_id ||
      !station_id ||
      !client_name ||
      !start_time ||
      !end_time ||
      !service_id
    ) {
      // Added station_id to validation
      res
        .status(400)
        .json({
          error:
            'Missing required fields: barber_id, station_id, client_name, start_time, end_time, service_id',
        }); // Updated error message
      return;
    }

    try {
      const newReservation = await reservationService.createReservation({
        barber_id,
        station_id, // Added station_id
        client_name,
        client_phone,
        client_email,
        start_time,
        end_time,
        service_id,
        notes,
      });
      res.status(201).json(newReservation);
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ error: 'Failed to create reservation.' });
    }
  }

  async updateReservation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const {
      barber_id,
      station_id,
      client_name,
      client_phone,
      client_email,
      start_time,
      end_time,
      service_id,
      status,
      notes,
    } = req.body;

    // Basic validation for required fields if they are being updated
    if (barber_id !== undefined && typeof barber_id !== 'number') {
      res.status(400).json({ error: 'barber_id must be a number' });
      return;
    }
    if (station_id !== undefined && typeof station_id !== 'number') {
      res.status(400).json({ error: 'station_id must be a number' });
      return;
    }
    if (client_name !== undefined && typeof client_name !== 'string') {
      res.status(400).json({ error: 'client_name must be a string' });
      return;
    }
    if (start_time !== undefined && typeof start_time !== 'string') {
      res
        .status(400)
        .json({ error: 'start_time must be a string (ISO date format)' });
      return;
    }
    if (end_time !== undefined && typeof end_time !== 'string') {
      res
        .status(400)
        .json({ error: 'end_time must be a string (ISO date format)' });
      return;
    }
    if (service_id !== undefined && typeof service_id !== 'number') {
      res.status(400).json({ error: 'service_id must be a number' });
      return;
    }
    if (status !== undefined && typeof status !== 'string') {
      res.status(400).json({ error: 'status must be a string' });
      return;
    }

    try {
      await reservationService.updateReservation(Number(id), {
        barber_id,
        station_id,
        client_name,
        client_phone,
        client_email,
        start_time,
        end_time,
        service_id,
        status,
        notes,
      });
      res.status(200).json({ message: 'Reservation updated successfully' });
    } catch (error) {
      console.error('Error updating reservation:', error);
      res.status(500).json({ error: 'Failed to update reservation.' });
    }
  }

  async deleteReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await reservationService.deleteReservation(Number(id));
      res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getReservationCount(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res
        .status(400)
        .json({ error: 'Missing startDate or endDate query parameters' });
      return;
    }
    try {
      const count = await reservationService.getReservationCount(
        startDate as string,
        endDate as string,
      );
      res.json({ count });
    } catch (error) {
      console.error('Error getting reservation count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCompletedReservationCount(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res
        .status(400)
        .json({ error: 'Missing startDate or endDate query parameters' });
      return;
    }
    try {
      const count = await reservationService.getCompletedReservationCount(
        startDate as string,
        endDate as string,
      );
      res.json({ count });
    } catch (error) {
      console.error('Error getting completed reservation count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCompletedReservations(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res
        .status(400)
        .json({ error: 'Missing startDate or endDate query parameters' });
      return;
    }
    try {
      const reservations = await reservationService.getCompletedReservations(
        startDate as string,
        endDate as string,
      );
      res.json(reservations);
    } catch (error) {
      console.error('Error getting completed reservations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async completeReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const newSale = await reservationService.completeReservationAndCreateSale(
        Number(id),
      );
      res
        .status(200)
        .json({
          message: 'Reservation completed and sale created successfully',
          sale: newSale,
        });
    } catch (error) {
      console.error('Error completing reservation and creating sale:', error);
      if (
        error instanceof Error &&
        (error.message.includes('Reservation not found') ||
          error.message.includes('already completed'))
      ) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to complete reservation and create sale.' });
      }
    }
  }
}

export const reservationController = new ReservationController();
