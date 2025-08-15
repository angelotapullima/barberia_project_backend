import { Request, Response } from 'express';
import * as saleService from '../services/sale.service';

// NOTE: The controller functions here will be refactored properly during the Reports task.
// The main goal for now is to remove the old createSale logic.

export const getSalesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const { sales, total } = await saleService.getAllSales(page, limit);
        res.json({ sales, total, page, limit });
    } catch (error) {
        res.status(500).json({ message: 'Error getting sales', error });
    }
};

export const getSaleByIdController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const sale = await saleService.getSaleById(Number(id));
        if (sale) {
            res.json(sale);
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error getting sale', error });
    }
};

export const getSaleByReservationIdController = async (req: Request, res: Response): Promise<void> => {
  const { reservationId } = req.params;
  try {
    const sale = await saleService.getSaleByReservationId(Number(reservationId));
    if (sale) {
      res.json(sale);
    } else {
      res.status(404).json({ message: 'No sale found for this reservation' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error getting sale by reservation ID', error });
  }
};
