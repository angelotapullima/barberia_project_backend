import { Request, Response } from 'express';
import * as service from '../services/service.service';

export const getAllServicesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await service.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
};

export const getServiceByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await service.getServiceById(id);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service', error });
  }
};

export const createServiceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const newService = await service.createService(req.body);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service', error });
  }
};

export const updateServiceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedService = await service.updateService(id, req.body);
    if (updatedService) {
      res.status(200).json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error });
  }
};

export const deleteServiceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const deletedService = await service.deleteService(id);
    if (deletedService) {
      res.status(200).json({ message: 'Service deactivated successfully' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating service', error });
  }
};
