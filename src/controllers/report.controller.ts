import { Request, Response } from 'express';
import {
  getComprehensiveSales,
  getServicesProductsSales,
  getDetailedBarberServiceSales,
  getStationUsage,
  getCustomerFrequency,
  getPeakHours,
} from '../services/report.service';

const handleReportError = (res: Response, error: any, message: string) => {
    console.error(message, error);
    res.status(500).json({ message });
}

export const getComprehensiveSalesReportController = async (req: Request, res: Response): Promise<void> => {
  try {
    const salesData = await getComprehensiveSales(req.query);
    res.json(salesData);
  } catch (error) {
    handleReportError(res, error, 'Error al obtener el reporte de ventas comprensivo.');
  }
};

export const getServicesProductsSalesReportController = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ message: 'Fechas de inicio y fin son requeridas.' });
    return;
  }
  try {
    const salesData = await getServicesProductsSales(String(startDate), String(endDate));
    res.json(salesData);
  } catch (error) {
    handleReportError(res, error, 'Error al obtener el reporte de ventas por tipo.');
  }
};

export const getStationUsageReportController = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ message: 'Fechas de inicio y fin son requeridas.' });
    return;
  }
  try {
    const data = await getStationUsage(String(startDate), String(endDate));
    res.json(data);
  } catch (error) {
    handleReportError(res, error, 'Error al obtener el reporte de uso de estaciones.');
  }
};

export const getCustomerFrequencyReportController = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ message: 'Fechas de inicio y fin son requeridas.' });
    return;
  }
  try {
    const data = await getCustomerFrequency(String(startDate), String(endDate));
    res.json(data);
  } catch (error) {
    handleReportError(res, error, 'Error al obtener el reporte de frecuencia de clientes.');
  }
};

export const getPeakHoursReportController = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ message: 'Fechas de inicio y fin son requeridas.' });
    return;
  }
  try {
    const data = await getPeakHours(String(startDate), String(endDate));
    res.json(data);
  } catch (error) {
    handleReportError(res, error, 'Error al obtener el reporte de horas pico.');
  }
};

export const getDetailedBarberServiceSalesReportController = async (req: Request, res: Response): Promise<void> => {
  try {
    const sales = await getDetailedBarberServiceSales(req.query);
    res.json(sales);
  } catch (error) {
    handleReportError(res, error, 'Error al obtener el reporte detallado de servicios por barbero.');
  }
};