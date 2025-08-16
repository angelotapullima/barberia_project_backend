import { Request, Response } from 'express';
import * as saleService from '../services/sale.service';

// NOTE: The controller functions here will be refactored properly during the Reports task.
// The main goal for now is to remove the old createSale logic.

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Obtiene todas las ventas registradas.
 *     description: Retorna una lista paginada de todas las ventas en el sistema.
 *     tags:
 *       - Ventas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para la paginación.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de elementos por página.
 *     responses:
 *       200:
 *         description: Lista de ventas obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       totalAmount:
 *                         type: number
 *                       saleDate:
 *                         type: string
 *                         format: date-time
 *                       # ... (otras propiedades de la venta)
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
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

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Obtiene una venta por su ID.
 *     description: Retorna los detalles de una venta específica.
 *     tags:
 *       - Ventas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la venta a obtener.
 *     responses:
 *       200:
 *         description: Venta obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 totalAmount:
 *                   type: number
 *                 saleDate:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       404:
 *         description: Venta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
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

/**
 * @swagger
 * /sales/by-reservation/{reservationId}:
 *   get:
 *     summary: Obtiene una venta por el ID de la reserva asociada.
 *     description: Retorna los detalles de una venta asociada a una reserva específica.
 *     tags:
 *       - Ventas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva.
 *     responses:
 *       200:
 *         description: Venta obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 totalAmount:
 *                   type: number
 *                 saleDate:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       404:
 *         description: No se encontró venta para esta reserva.
 *       500:
 *         description: Error interno del servidor.
 */
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