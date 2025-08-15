import { Request, Response } from 'express';
import {
  getAllSales,
  getSaleById,
  createSale,
  getSaleByReservationId,
  getSalesSummaryByDateRange, // Import the new service function
  getSalesSummaryByService,   // Import the new service function
} from '../services/sale.service';

export const getSalesSummaryController = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ message: 'Fechas de inicio y fin son requeridas.' });
    return;
  }
  try {
    const summary = await getSalesSummaryByDateRange(String(startDate), String(endDate));
    res.json(summary);
  } catch (error) {
    console.error('Error getting sale summary:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getSalesSummaryByServiceController = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ message: 'Fechas de inicio y fin son requeridas.' });
    return;
  }
  try {
    const summary = await getSalesSummaryByService(String(startDate), String(endDate));
    res.json(summary);
  } catch (error) {
    console.error('Error getting sale summary by service:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getSalesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const { sales, total } = await getAllSales(page, limit);
        res.json({ sales, total, page, limit });
    } catch (error) {
        console.error('Error getting sales:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const getSaleByIdController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const saleId = Number(id);

    if (isNaN(saleId)) {
        res.status(400).json({ message: 'ID de venta inválido.' });
        return;
    }

    try {
        const sale = await getSaleById(saleId);
        if (sale) {
            res.json(sale);
        } else {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
    } catch (error) {
        console.error(`Error getting sale ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const createSaleController = async (req: Request, res: Response): Promise<void> => {
  const { sale_date, sale_items, total_amount, payment_method } = req.body;
  if (!sale_date || !sale_items || !Array.isArray(sale_items) || sale_items.length === 0 || total_amount === undefined || !payment_method) {
    res.status(400).json({ message: 'Faltan campos requeridos o son inválidos' });
    return;
  }

  try {
    const newSale = await createSale(req.body);
    res.status(201).json(newSale);
  } catch (error) {
    console.error('Error creating sale:', error);
    const errorMessage = error instanceof Error ? error.message : 'No se pudo registrar la venta.';
    res.status(500).json({ message: errorMessage });
  }
};

export const getSaleByReservationIdController = async (req: Request, res: Response): Promise<void> => {
  const { reservationId } = req.params;
  try {
    const sale = await getSaleByReservationId(Number(reservationId));
    if (sale) {
      res.json(sale);
    } else {
      res.status(404).json({ message: 'No se encontró una venta para esa reservación' });
    }
  } catch (error) {
    console.error('Error getting sale by reservation ID:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};