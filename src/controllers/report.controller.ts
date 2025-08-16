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

/**
 * @swagger
 * /reports/comprehensive-sales:
 *   get:
 *     summary: Obtiene un reporte comprensivo de ventas.
 *     description: Retorna datos agregados de ventas, filtrables por rango de fechas, barbero, servicio, etc.
 *     tags:
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de inicio para el reporte (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de fin para el reporte (YYYY-MM-DD).
 *       # ... (añadir otros parámetros de filtro si existen en el servicio)
 *     responses:
 *       200:
 *         description: Reporte de ventas comprensivo obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSalesAmount:
 *                   type: number
 *                 totalServicesSold:
 *                   type: number
 *                 totalProductsSold:
 *                   type: number
 *                 # ... (otras propiedades del reporte)
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getComprehensiveSalesReportController = async (req: Request, res: Response): Promise<void> => {
  try {
    const salesData = await getComprehensiveSales(req.query);
    res.json(salesData);
  } catch (error) {
    handleReportError(res, error, 'Error al obtener el reporte de ventas comprensivo.');
  }
};

/**
 * @swagger
 * /reports/services-products-sales:
 *   get:
 *     summary: Obtiene un reporte de ventas por servicios y productos.
 *     description: Retorna las ventas detalladas de servicios y productos dentro de un rango de fechas.
 *     tags:
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de inicio para el reporte (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de fin para el reporte (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Reporte de ventas por servicios y productos obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 servicesSales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       serviceName:
 *                         type: string
 *                       totalSales:
 *                         type: number
 *                 productsSales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productName:
 *                         type: string
 *                       totalSales:
 *                         type: number
 *       400:
 *         description: Fechas de inicio y fin son requeridas.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
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

/**
 * @swagger
 * /reports/station-usage:
 *   get:
 *     summary: Obtiene un reporte de uso de estaciones.
 *     description: Retorna el tiempo de uso de cada estación dentro de un rango de fechas.
 *     tags:
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de inicio para el reporte (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de fin para el reporte (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Reporte de uso de estaciones obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   stationName:
 *                     type: string
 *                   totalUsageMinutes:
 *                     type: number
 *       400:
 *         description: Fechas de inicio y fin son requeridas.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
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

/**
 * @swagger
 * /reports/customer-frequency:
 *   get:
 *     summary: Obtiene un reporte de frecuencia de clientes.
 *     description: Retorna la frecuencia de visitas de los clientes dentro de un rango de fechas.
 *     tags:
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de inicio para el reporte (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de fin para el reporte (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Reporte de frecuencia de clientes obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   customerId:
 *                     type: number
 *                   customerName:
 *                     type: string
 *                   visitCount:
 *                     type: number
 *       400:
 *         description: Fechas de inicio y fin son requeridas.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
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

/**
 * @swagger
 * /reports/peak-hours:
 *   get:
 *     summary: Obtiene un reporte de horas pico.
 *     description: Retorna las horas del día con mayor actividad (reservas, ventas) dentro de un rango de fechas.
 *     tags:
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de inicio para el reporte (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de fin para el reporte (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Reporte de horas pico obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hour:
 *                     type: string
 *                     description: Hora del día (ej. '09:00').
 *                   activityCount:
 *                     type: number
 *                     description: Número de actividades (reservas/ventas) en esa hora.
 *       400:
 *         description: Fechas de inicio y fin son requeridas.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
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

/**
 * @swagger
 * /reports/detailed-barber-service-sales:
 *   get:
 *     summary: Obtiene un reporte detallado de ventas de servicios por barbero.
 *     description: Retorna las ventas de servicios realizadas por cada barbero, filtrables por rango de fechas.
 *     tags:
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de inicio para el reporte (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de fin para el reporte (YYYY-MM-DD).
 *       - in: query
 *         name: barberId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID del barbero para filtrar el reporte.
 *     responses:
 *       200:
 *         description: Reporte detallado de ventas de servicios por barbero obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   barberName:
 *                     type: string
 *                   serviceName:
 *                     type: string
 *                   saleDate:
 *                     type: string
 *                     format: date
 *                   amount:
 *                     type: number
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getDetailedBarberServiceSalesReportController = async (req: Request, res: Response): Promise<void> => {
  try {
    const sales = await getDetailedBarberServiceSales(req.query);
    res.json(sales);
  } catch (error) {
    handleReportError(res, error, 'Error al obtener el reporte detallado de servicios por barbero.');
  }
};
