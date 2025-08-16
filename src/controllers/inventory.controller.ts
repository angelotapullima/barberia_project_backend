import { Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service';

/**
 * @swagger
 * /inventory/summary:
 *   get:
 *     summary: Obtiene un resumen del inventario actual.
 *     description: Retorna la cantidad total de cada producto en el inventario.
 *     tags:
 *       - Inventario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen del inventario obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: number
 *                   productName:
 *                     type: string
 *                   currentStock:
 *                     type: number
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getInventorySummaryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await inventoryService.getInventorySummary();
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory summary', error });
  }
};

/**
 * @swagger
 * /inventory/movements:
 *   get:
 *     summary: Obtiene los movimientos de inventario.
 *     description: Retorna una lista de todos los movimientos de inventario, opcionalmente filtrados por ID de producto.
 *     tags:
 *       - Inventario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID del producto para filtrar los movimientos.
 *     responses:
 *       200:
 *         description: Movimientos de inventario obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   productId:
 *                     type: number
 *                   type:
 *                     type: string
 *                     enum: [entrada, salida]
 *                   quantity:
 *                     type: number
 *                   movementDate:
 *                     type: string
 *                     format: date-time
 *                   referenceType:
 *                     type: string
 *                   referenceId:
 *                     type: number
 *                   notes:
 *                     type: string
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getInventoryMovementsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId as string, 10) : undefined;
    const movements = await inventoryService.getInventoryMovements(productId);
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory movements', error });
  }
};

/**
 * @swagger
 * /inventory/movements:
 *   post:
 *     summary: Añade un nuevo movimiento de inventario.
 *     description: Registra una entrada o salida de productos en el inventario.
 *     tags:
 *       - Inventario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - type
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID del producto afectado.
 *               type:
 *                 type: string
 *                 enum: [entrada, salida]
 *                 description: Tipo de movimiento (entrada o salida).
 *               quantity:
 *                 type: number
 *                 description: Cantidad de productos en el movimiento.
 *               referenceType:
 *                 type: string
 *                 description: Tipo de referencia del movimiento (ej. 'venta', 'compra').
 *                 nullable: true
 *               referenceId:
 *                 type: integer
 *                 description: ID de la referencia del movimiento (ej. ID de venta).
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 description: Notas adicionales sobre el movimiento.
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Movimiento de inventario añadido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 productId:
 *                   type: number
 *                 type:
 *                   type: string
 *                 quantity:
 *                   type: number
 *                 movementDate:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID de producto, tipo y cantidad son requeridos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
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