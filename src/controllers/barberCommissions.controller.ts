import { Request, Response } from 'express';
import * as barberCommissionsService from '../services/barberCommissions.service';

/**
 * @swagger
 * /barber-commissions/monthly-summary:
 *   get:
 *     summary: Obtiene el resumen de comisiones mensuales para todos los barberos.
 *     description: Retorna un resumen de las comisiones calculadas en vivo para cada barbero para un mes y año específicos.
 *     tags:
 *       - Comisiones de Barberos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: El año para el cual se desean las comisiones (ej. 2023).
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         required: true
 *         description: El mes para el cual se desean las comisiones (1-12).
 *     responses:
 *       200:
 *         description: Resumen de comisiones mensuales obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   barberId:
 *                     type: number
 *                   barberName:
 *                     type: string
 *                   totalCommissions:
 *                     type: number
 *                   # ... (otras propiedades del resumen)
 *       400:
 *         description: Parámetros de consulta 'year' y 'month' son requeridos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getMonthlyBarberCommissionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);
    if (!year || !month) {
      res.status(400).json({ message: 'Year and month are required query parameters.' });
      return;
    }
    const commissions = await barberCommissionsService.getMonthlyBarberCommissions(year, month);
    res.status(200).json(commissions);
  } catch (error) {
    console.error('Error fetching monthly barber commissions:', error);
    res.status(500).json({ message: 'Error fetching monthly barber commissions', error });
  }
};

/**
 * @swagger
 * /barber-commissions/finalize-payment:
 *   post:
 *     summary: Crea y finaliza un pago de comisiones para un barbero.
 *     description: Registra un pago de comisiones para un barbero específico para un mes y año dados, marcando el período como finalizado.
 *     tags:
 *       - Comisiones de Barberos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - barberId
 *               - year
 *               - month
 *             properties:
 *               barberId:
 *                 type: integer
 *                 description: ID del barbero.
 *               year:
 *                 type: integer
 *                 description: El año del pago.
 *               month:
 *                 type: integer
 *                 description: El mes del pago (1-12).
 *     responses:
 *       201:
 *         description: Pago creado y finalizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     barberId:
 *                       type: number
 *                     amount:
 *                       type: number
 *                     # ... (otras propiedades del pago)
 *       400:
 *         description: barberId, year y month son requeridos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos o el período no ha terminado.
 *       409:
 *         description: El pago para este período ya ha sido registrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const createAndFinalizePaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barberId, year, month } = req.body;
    if (!barberId || !year || !month) {
      res.status(400).json({ message: 'barberId, year, and month are required.' });
      return;
    }
    const newPayment = await barberCommissionsService.createAndFinalizePayment(barberId, year, month);
    res.status(201).json({ message: 'Payment created and finalized successfully.', payment: newPayment });
  } catch (error) {
    const err = error as Error;
    console.error('Error creating and finalizing payment:', err.message);

    if (err.message.includes('already been registered')) {
      res.status(409).json({ message: err.message }); // 409 Conflict
    } else if (err.message.includes('period has not ended')) {
      res.status(403).json({ message: err.message }); // 403 Forbidden
    } else {
      res.status(500).json({ message: 'Error creating and finalizing payment', error: err.message });
    }
  }
};

/**
 * @swagger
 * /barber-commissions/{barberId}/services:
 *   get:
 *     summary: Obtiene los servicios detallados de un barbero para un mes específico.
 *     description: Retorna una lista de todos los servicios realizados por un barbero en un mes y año dados.
 *     tags:
 *       - Comisiones de Barberos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barberId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del barbero.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: El año para el cual se desean los servicios (ej. 2023).
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         required: true
 *         description: El mes para el cual se desean los servicios (1-12).
 *     responses:
 *       200:
 *         description: Servicios del barbero obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   serviceId:
 *                     type: number
 *                   serviceName:
 *                     type: string
 *                   price:
 *                     type: number
 *                   commission:
 *                     type: number
 *                   # ... (otras propiedades del servicio)
 *       400:
 *         description: ID de barbero, año y mes son requeridos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getBarberServicesForMonthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const barberId = parseInt(req.params.barberId as string, 10);
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);
    if (!barberId || !year || !month) {
      res.status(400).json({ message: 'Barber ID, year, and month are required.' });
      return;
    }
    const services = await barberCommissionsService.getBarberServicesForMonth(barberId, year, month);
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching barber services for month:', error);
    res.status(500).json({ message: 'Error fetching barber services for month', error });
  }
};

/**
 * @swagger
 * /barber-commissions/{barberId}/advances:
 *   get:
 *     summary: Obtiene los adelantos detallados de un barbero para un mes específico.
 *     description: Retorna una lista de todos los adelantos de dinero realizados a un barbero en un mes y año dados.
 *     tags:
 *       - Comisiones de Barberos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barberId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del barbero.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: El año para el cual se desean los adelantos (ej. 2023).
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         required: true
 *         description: El mes para el cual se desean los adelantos (1-12).
 *     responses:
 *       200:
 *         description: Adelantos del barbero obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   advanceId:
 *                     type: number
 *                   amount:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date
 *                   notes:
 *                     type: string
 *                   # ... (otras propiedades del adelanto)
 *       400:
 *         description: ID de barbero, año y mes son requeridos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getBarberAdvancesForMonthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const barberId = parseInt(req.params.barberId as string, 10);
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);
    if (!barberId || !year || !month) {
      res.status(400).json({ message: 'Barber ID, year, and month are required.' });
      return;
    }
    const advances = await barberCommissionsService.getBarberAdvancesForMonth(barberId, year, month);
    res.status(200).json(advances);
  } catch (error) {
    console.error('Error fetching barber advances for month:', error);
    res.status(500).json({ message: 'Error fetching barber advances for month', error });
  }
};