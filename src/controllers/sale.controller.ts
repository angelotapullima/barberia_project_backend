import { Request, Response } from 'express';
import { saleService } from '../services/sale.service';

class SaleController {
  async getAllSales(req: Request, res: Response): Promise<void> {
    try {
      const sales = await saleService.getAllSales();
      res.json(sales);
    } catch (error) {
      console.error('Error getting sales:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSalesFiltered(req: Request, res: Response): Promise<void> {
    const { filterType, filterValue } = req.query;

    if (!filterType || !filterValue) {
      res
        .status(400)
        .json({ error: 'Missing filterType or filterValue query parameters' });
      return;
    }

    try {
      const sales = await saleService.getFilteredSales(
        filterType as string,
        filterValue as string,
      );
      res.json(sales);
    } catch (error) {
      console.error('Error getting filtered sales:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createSale(req: Request, res: Response): Promise<void> {
    const {
      sale_date,
      sale_items,
      total_amount,
      customer_name,
      payment_method,
      reservation_id,
    } = req.body;

    // Validation for always required fields
    if (
      !sale_date ||
      !sale_items ||
      !Array.isArray(sale_items) ||
      sale_items.length === 0 ||
      total_amount === undefined ||
      !payment_method
    ) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    try {
      const newSale = await saleService.createSale({
        sale_date,
        sale_items,
        total_amount,
        customer_name,
        payment_method,
        reservation_id,
      });
      res.status(201).json({ id: newSale.id });
    } catch (error) {
      console.error('Error creating sale:', error);
      res.status(500).json({ error: 'Failed to record sale.' });
    }
  }

  async getSaleByReservationId(req: Request, res: Response): Promise<void> {
    const { reservationId } = req.params;

    if (!reservationId) {
      res.status(400).json({ error: 'Missing reservationId parameter' });
      return;
    }

    try {
      const sale = await saleService.getSaleByReservationId(
        Number(reservationId),
      );
      if (sale) {
        res.json(sale);
      } else {
        res
          .status(404)
          .json({ error: 'Sale not found for this reservation ID' });
      }
    } catch (error) {
      console.error('Error getting sale by reservation ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getDailySalesSummary(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res
        .status(400)
        .json({ error: 'Missing startDate or endDate query parameters' });
      return;
    }

    try {
      const salesSummary = await saleService.getSalesSummaryByDateRange(
        startDate as string,
        endDate as string,
      );
      res.json(salesSummary);
    } catch (error) {
      console.error('Error getting daily sales summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  

  async getSalesSummaryByService(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res
        .status(400)
        .json({ error: 'Missing startDate or endDate query parameters' });
      return;
    }

    try {
      const summary = await saleService.getSalesSummaryByService(
        startDate as string,
        endDate as string,
      );
      res.json(summary);
    } catch (error) {
      console.error('Error getting sales summary by service:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSalesSummaryByPaymentMethod(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res
        .status(400)
        .json({ error: 'Missing startDate or endDate query parameters' });
      return;
    }

    try {
      const summary = await saleService.getSalesSummaryByPaymentMethod(
        startDate as string,
        endDate as string,
      );
      res.json(summary);
    } catch (error) {
      console.error('Error getting sales summary by payment method:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getDailySalesByTypeReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res
        .status(400)
        .json({ error: 'Missing startDate or endDate query parameters' });
      return;
    }

    try {
      const sales = await saleService.getDailySalesByType(
        startDate as string,
        endDate as string,
      );
      res.json(sales);
    } catch (error) {
      console.error('Error getting daily sales by type report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const saleController = new SaleController();
