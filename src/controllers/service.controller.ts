import { Request, Response } from 'express';
import { serviceService } from '../services/service.service';

class ServiceController {
  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      const services = await serviceService.getAllServices();
      res.json(services);
    } catch (error) {
      console.error('Error getting services:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createService(req: Request, res: Response): Promise<void> {
    const { name, price, duration_minutes } = req.body;
    if (!name || price === undefined || duration_minutes === undefined) {
      res
        .status(400)
        .json({ error: 'Name, price, and duration_minutes are required' });
      return;
    }
    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({ error: 'Price must be a non-negative number' });
      return;
    }
    if (typeof duration_minutes !== 'number' || duration_minutes < 0) {
      res
        .status(400)
        .json({ error: 'Duration minutes must be a non-negative number' });
      return;
    }
    try {
      const newService = await serviceService.createService({
        name,
        price,
        duration_minutes,
      });
      res.status(201).json(newService);
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateService(req: Request, res: Response): Promise<void> {
    const { name, price, duration_minutes } = req.body;
    const { id } = req.params;
    if (!name || price === undefined || duration_minutes === undefined) {
      res
        .status(400)
        .json({ error: 'Name, price, and duration_minutes are required' });
      return;
    }
    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({ error: 'Price must be a non-negative number' });
      return;
    }
    if (typeof duration_minutes !== 'number' || duration_minutes < 0) {
      res
        .status(400)
        .json({ error: 'Duration minutes must be a non-negative number' });
      return;
    }
    try {
      const updatedService = await serviceService.updateService(Number(id), {
        name,
        price,
        duration_minutes,
      });
      if (!updatedService) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      res.status(200).json(updatedService);
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteService(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const result = await serviceService.deleteService(Number(id));
      if (typeof result === 'object' && 'error' in result) {
        res.status(400).json({ error: result.error });
        return;
      }
      if (result === false) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await serviceService.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProductStock(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { quantity } = req.body;

    if (
      quantity === undefined ||
      typeof quantity !== 'number' ||
      quantity < 0
    ) {
      res.status(400).json({ error: 'Quantity must be a non-negative number' });
      return;
    }

    try {
      const updatedProduct = await serviceService.updateProductStock(
        Number(id),
        quantity,
      );
      if (!updatedProduct) {
        res
          .status(404)
          .json({ error: 'Product not found or not a product type' });
        return;
      }
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating product stock:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLowStockProducts(req: Request, res: Response): Promise<void> {
    try {
      const lowStockProducts = await serviceService.getLowStockProducts();
      res.json(lowStockProducts);
    } catch (error) {
      console.error('Error getting low stock products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getInventoryReportSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = await serviceService.getInventoryReportSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error getting inventory report summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const serviceController = new ServiceController();
