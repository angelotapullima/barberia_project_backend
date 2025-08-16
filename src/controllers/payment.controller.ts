import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Obtiene todos los pagos registrados.
 *     description: Retorna una lista de todos los pagos en el sistema.
 *     tags:
 *       - Pagos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   amount:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date
 *                   # ... (otras propiedades del pago)
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getAllPaymentsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error });
  }
};

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Actualiza un pago existente.
 *     description: Actualiza los detalles de un pago específico por su ID.
 *     tags:
 *       - Pagos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pago a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Nuevo monto del pago.
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha del pago.
 *               # ... (otras propiedades a actualizar)
 *     responses:
 *       200:
 *         description: Pago actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 amount:
 *                   type: number
 *                 date:
 *                   type: string
 *                   format: date
 *       400:
 *         description: Datos de entrada inválidos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       404:
 *         description: Pago no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const updatePaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedPayment = await paymentService.updatePayment(id, req.body);
    if (updatedPayment) {
      res.status(200).json(updatedPayment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error });
  }
};