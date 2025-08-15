import { Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service';

export const getInventorySummaryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await inventoryService.getInventorySummary();
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory summary', error });
  }
};

export const getInventoryMovementsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId as string, 10) : undefined;
    const movements = await inventoryService.getInventoryMovements(productId);
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory movements', error });
  }
};

export const addInventoryMovementController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, type, quantity, referenceType, referenceId, notes } = req.body;
    if (!productId || !type || !quantity) {
      res.status(400).json({ message: 'Product ID, type, and quantity are required.' });
      return;
    }
    const newMovement = await inventoryService.addInventoryMovement(productId, type, quantity, referenceType, referenceId, notes);
    res.status(201).json(newMovement);
  } catch (error) {
    res.status(500).json({ message: 'Error adding inventory movement', error });
  }
};
