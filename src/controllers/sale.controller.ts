import { Request, Response } from 'express';
import {
  getAllSales,
  getSaleById,
  createSale,
  getSaleByReservationId,
} from '../services/sale.service';

export const getSalesController = async (req: Request, res: Response): Promise<void> => {
    try {
        // En el futuro, se pueden añadir filtros aquí si es necesario
        const sales = await getAllSales();
        res.json(sales);
    } catch (error) {
        console.error('Error getting sales:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const getSaleByIdController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const sale = await getSaleById(Number(id));
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