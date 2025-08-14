import { Request, Response } from 'express';
import { stationService } from '../services/station.service';

class StationController {
  async getAllStations(req: Request, res: Response): Promise<void> {
    try {
      const stations = await stationService.getAllStations();
      res.json(stations);
    } catch (error) {
      console.error('Error getting stations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createStation(req: Request, res: Response): Promise<void> {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    try {
      const newStation = await stationService.createStation({ name });
      if ('error' in newStation) {
        res.status(400).json({ error: newStation.error });
        return;
      }
      res.status(201).json(newStation);
    } catch (error) {
      console.error('Error creating station:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateStation(req: Request, res: Response): Promise<void> {
    const { name } = req.body;
    const { id } = req.params;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    try {
      const updatedStation = await stationService.updateStation(Number(id), {
        name,
      });
      if (!updatedStation) {
        res.status(404).json({ error: 'Station not found' });
        return;
      }
      if ('error' in updatedStation) {
        res.status(400).json({ error: updatedStation.error });
        return;
      }
      res.status(200).json(updatedStation);
    } catch (error) {
      console.error('Error updating station:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteStation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const result = await stationService.deleteStation(Number(id));
      if (typeof result === 'object' && 'error' in result) {
        res.status(400).json({ error: result.error });
        return;
      }
      if (result === false) {
        res.status(404).json({ error: 'Station not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting station:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const stationController = new StationController();
