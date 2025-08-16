import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Obtiene un resumen de los datos del dashboard.
 *     description: Retorna un resumen de ventas, reservas, barberos y otros datos clave para el dashboard.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen del dashboard obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: number
 *                   description: Ventas totales.
 *                 totalReservations:
 *                   type: number
 *                   description: Número total de reservas.
 *                 activeBarbers:
 *                   type: number
 *                   description: Número de barberos activos.
 *                 # ... (añadir más propiedades según el modelo de datos del resumen)
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error del servidor.
 */
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await dashboardService.getDashboardSummary();
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard summary', error });
  }
};
