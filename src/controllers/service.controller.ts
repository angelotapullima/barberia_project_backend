import { Request, Response } from 'express';
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
  getProducts,
  updateProductStock,
  getLowStockProducts,
  getInventoryReportSummary,
} from '../services/service.service';

// --- VALIDATION (se puede mover a middleware) ---
const validateService = (body: any) => {
    const { name, price, duration_minutes, type } = body;
    if (type === 'service' && (name === undefined || price === undefined || duration_minutes === undefined)) {
        return 'Para servicios, se requieren nombre, precio y duración.';
    }
    if (type === 'product' && (name === undefined || price === undefined)) {
        return 'Para productos, se requieren nombre y precio.';
    }
    return null;
}

// --- CONTROLLERS ---
export const getAllServicesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await getAllServices();
    res.json(services);
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createServiceController = async (req: Request, res: Response): Promise<void> => {
  const validationError = validateService(req.body);
  if (validationError) {
      res.status(400).json({ message: validationError });
      return;
  }
  try {
    const newService = await createService(req.body);
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateServiceController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const validationError = validateService(req.body);
  if (validationError) {
      res.status(400).json({ message: validationError });
      return;
  }
  try {
    const updatedService = await updateService(Number(id), req.body);
    if (!updatedService) {
      res.status(404).json({ message: 'Servicio o producto no encontrado' });
      return;
    }
    res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteServiceController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await deleteService(Number(id));
    if ('error' in result) {
      res.status(400).json(result);
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getProductsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateProductStockController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
    res.status(400).json({ message: 'La cantidad debe ser un número no negativo' });
    return;
  }

  try {
    const updatedProduct = await updateProductStock(Number(id), quantity);
    if (!updatedProduct) {
      res.status(404).json({ message: 'Producto no encontrado o el item no es un producto' });
      return;
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getLowStockProductsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const lowStockProducts = await getLowStockProducts();
    res.json(lowStockProducts);
  } catch (error) {
    console.error('Error getting low stock products:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getInventoryReportSummaryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await getInventoryReportSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting inventory report summary:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};