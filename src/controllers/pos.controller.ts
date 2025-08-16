import { Request, Response } from 'express';
import * as posService from '../services/pos.service';

/**
 * @swagger
 * /pos/master-data:
 *   get:
 *     summary: Obtiene los datos maestros para el punto de venta (POS).
 *     description: Retorna datos esenciales como listas de productos, servicios, barberos, etc., necesarios para la operación del POS.
 *     tags:
 *       - POS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos maestros obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                 barbers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       name:
 *                         type: string
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getPosMasterData = async (req: Request, res: Response): Promise<void> => {
  try {
    const masterData = await posService.getPosMasterData();
    res.status(200).json(masterData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching POS master data', error });
  }
};