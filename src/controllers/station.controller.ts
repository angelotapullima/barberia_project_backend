import { Request, Response } from 'express';
import {
  getAllStations,
  createStation,
  updateStation,
  deleteStation,
} from '../services/station.service';

export const getAllStationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const stations = await getAllStations();
    res.json(stations);
  } catch (error) {
    console.error('Error getting stations:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createStationController = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ message: 'El nombre es requerido' });
    return;
  }
  try {
    const newStation = await createStation({ name, description });
    if ('error' in newStation) {
      res.status(400).json(newStation);
      return;
    }
    res.status(201).json(newStation);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateStationController = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;
  const { id } = req.params;
  if (!name) {
    res.status(400).json({ message: 'El nombre es requerido' });
    return;
  }
  try {
    const updatedStation = await updateStation(Number(id), {
      name,
      description,
    });
    if (!updatedStation) {
      res.status(404).json({ message: 'Estación no encontrada' });
      return;
    }
    if ('error' in updatedStation) {
      res.status(400).json(updatedStation);
      return;
    }
    res.status(200).json(updatedStation);
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteStationController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await deleteStation(Number(id));
    if ('error' in result) {
      res.status(400).json(result);
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};