import { Request, Response } from 'express';
import { barberService } from '../services/barber.service';

class BarberController {
  async getAllBarbers(req: Request, res: Response): Promise<void> {
    try {
      const barbers = await barberService.getAllBarbers();
      res.json(barbers);
    } catch (error) {
      console.error('Error getting barbers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createBarber(req: Request, res: Response): Promise<void> {
    const { name, station_id, base_salary } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (
      base_salary !== undefined &&
      (typeof base_salary !== 'number' || base_salary < 0)
    ) {
      res
        .status(400)
        .json({ error: 'Base salary must be a non-negative number' });
      return;
    }
    try {
      const newBarber = await barberService.createBarber({
        name,
        station_id,
        base_salary,
      });
      res.status(201).json(newBarber);
    } catch (error) {
      console.error('Error creating barber:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateBarber(req: Request, res: Response): Promise<void> {
    const { name, station_id, base_salary } = req.body;
    const { id } = req.params;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (
      base_salary !== undefined &&
      (typeof base_salary !== 'number' || base_salary < 0)
    ) {
      res
        .status(400)
        .json({ error: 'Base salary must be a non-negative number' });
      return;
    }
    try {
      const updatedBarber = await barberService.updateBarber(Number(id), {
        name,
        station_id,
        base_salary,
      });
      if (!updatedBarber) {
        res.status(404).json({ error: 'Barber not found' });
        return;
      }
      res.status(200).json(updatedBarber);
    } catch (error) {
      console.error('Error updating barber:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteBarber(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const deleted = await barberService.deleteBarber(Number(id));
      if (!deleted) {
        res.status(404).json({ error: 'Barber not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting barber:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const barberController = new BarberController();
