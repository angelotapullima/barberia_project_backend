import { Request, Response } from 'express';
import * as reservationService from '../services/reservation.service';

/**
 * @swagger
 * /reservations/{id}/products:
 *   post:
 *     summary: Añade un producto a una reserva existente.
 *     description: Permite añadir un producto a una reserva específica por su ID.
 *     tags:
 *       - Reservas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva a la que se añadirá el producto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID del producto a añadir.
 *               quantity:
 *                 type: integer
 *                 description: Cantidad del producto a añadir.
 *     responses:
 *       201:
 *         description: Producto añadido a la reserva exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 reservationId:
 *                   type: number
 *                 productId:
 *                   type: number
 *                 quantity:
 *                   type: number
 *       400:
 *         description: productId y quantity son requeridos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
export const addProductToReservationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const reservationId = parseInt(req.params.id, 10);
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            res.status(400).json({ message: 'productId and quantity are required' });
            return;
        }
        const newProduct = await reservationService.addProductToReservation(reservationId, productId, quantity);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product to reservation', error });
    }
};

/**
 * @swagger
 * /reservations/{id}/products/{reservationProductId}:
 *   delete:
 *     summary: Elimina un producto de una reserva.
 *     description: Elimina un producto específico de una reserva por su ID de producto de reserva.
 *     tags:
 *       - Reservas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva.
 *       - in: path
 *         name: reservationProductId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto de la reserva a eliminar.
 *     responses:
 *       204:
 *         description: Producto eliminado de la reserva exitosamente.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
export const removeProductFromReservationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reservationProductId } = req.params;
        await reservationService.removeProductFromReservation(parseInt(reservationProductId, 10));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error removing product from reservation', error });
    }
};

/**
 * @swagger
 * /reservations/{id}/complete:
 *   post:
 *     summary: Completa una reserva y crea una venta.
 *     description: Marca una reserva como completada y genera un registro de venta asociado.
 *     tags:
 *       - Reservas
 *       - Ventas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva a completar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 description: Método de pago utilizado para la venta.
 *     responses:
 *       200:
 *         description: Reserva completada y venta creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sale:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     totalAmount:
 *                       type: number
 *                     # ... (otras propiedades de la venta)
 *       400:
 *         description: paymentMethod es requerido.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
export const completeReservationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservationId = parseInt(req.params.id, 10);
    const { paymentMethod } = req.body;
    if (!paymentMethod) {
        res.status(400).json({ message: 'paymentMethod is required' });
        return;
    }
    const newSale = await reservationService.completeReservationAndCreateSale(reservationId, paymentMethod);
    res.status(200).json({
      message: 'Reservation completed and sale created successfully',
      sale: newSale,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    res.status(500).json({ message: errorMessage });
  }
};

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Obtiene todas las reservas.
 *     description: Retorna una lista paginada de todas las reservas, con opción de incluir detalles de venta.
 *     tags:
 *       - Reservas
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
 *       - in: query
 *         name: includeSaleDetails
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Si es 'true', incluye los detalles de la venta asociada a la reserva.
 *     responses:
 *       200:
 *         description: Lista de reservas obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reservations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       # ... (otras propiedades de la reserva)
 *                 totalCount:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 currentPage:
 *                   type: number
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getAllReservationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const includeSaleDetails = req.query.includeSaleDetails === 'true';

    const result = await reservationService.getAllReservations(page, limit, includeSaleDetails);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting all reservations:', error);
    res.status(500).json({ message: 'Error getting all reservations' });
  }
};

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Obtiene una reserva por su ID.
 *     description: Retorna los detalles de una reserva específica, con opción de incluir productos asociados.
 *     tags:
 *       - Reservas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva a obtener.
 *       - in: query
 *         name: includeProducts
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Si es 'true', incluye los productos asociados a la reserva.
 *     responses:
 *       200:
 *         description: Reserva obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 # ... (otras propiedades de la reserva)
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       404:
 *         description: Reserva no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
export const getReservationByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservationId = parseInt(req.params.id, 10);
    const includeProducts = req.query.includeProducts === 'true';

    const reservation = await reservationService.getReservationById(reservationId, includeProducts);

    if (reservation) {
      res.status(200).json(reservation);
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    console.error('Error getting reservation by ID:', error);
    res.status(500).json({ message: 'Error getting reservation by ID' });
  }
};

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Crea una nueva reserva.
 *     description: Registra una nueva reserva en el sistema.
 *     tags:
 *       - Reservas
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
 *               - serviceId
 *               - startTime
 *               - endTime
 *             properties:
 *               barberId:
 *                 type: integer
 *                 description: ID del barbero asignado a la reserva.
 *               stationId:
 *                 type: integer
 *                 description: ID de la estación asignada.
 *               serviceId:
 *                 type: integer
 *                 description: ID del servicio reservado.
 *               clientName:
 *                 type: string
 *                 description: Nombre del cliente.
 *               clientPhone:
 *                 type: string
 *                 description: Teléfono del cliente.
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Hora de inicio de la reserva.
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: Hora de fin de la reserva.
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, in_progress, completed, paid, cancelled]
 *                 description: Estado de la reserva.
 *               servicePrice:
 *                 type: number
 *                 description: Precio del servicio.
 *               notes:
 *                 type: string
 *                 description: Notas adicionales sobre la reserva.
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 barberId:
 *                   type: number
 *                 serviceId:
 *                   type: number
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos de entrada inválidos o incompletos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
export const createReservationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const newReservation = await reservationService.createReservation(req.body);
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error });
  }
};

/**
 * @swagger
 * /reservations/{id}:
 *   put:
 *     summary: Actualiza una reserva existente.
 *     description: Actualiza los detalles de una reserva específica por su ID.
 *     tags:
 *       - Reservas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               barberId:
 *                 type: integer
 *                 description: Nuevo ID del barbero asignado a la reserva.
 *               stationId:
 *                 type: integer
 *                 description: Nuevo ID de la estación asignada.
 *               serviceId:
 *                 type: integer
 *                 description: Nuevo ID del servicio reservado.
 *               clientName:
 *                 type: string
 *                 description: Nuevo nombre del cliente.
 *               clientPhone:
 *                 type: string
 *                 description: Nuevo teléfono del cliente.
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva hora de inicio de la reserva.
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva hora de fin de la reserva.
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, in_progress, completed, paid, cancelled]
 *                 description: Nuevo estado de la reserva.
 *               notes:
 *                 type: string
 *                 description: Nuevas notas adicionales sobre la reserva.
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 barberId:
 *                   type: number
 *                 # ... (otras propiedades de la reserva actualizada)
 *       400:
 *         description: Datos de entrada inválidos o incompletos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       404:
 *         description: Reserva no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
export const updateReservationController = async (req: Request, res: Response): Promise<void> => {
  // This function needs to be updated to use the new service logic
    res.status(511).json({ message: 'Not yet implemented' });
};

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Elimina una reserva.
 *     description: Elimina una reserva específica por su ID.
 *     tags:
 *       - Reservas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva a eliminar.
 *     responses:
 *       204:
 *         description: Reserva eliminada exitosamente (No Content).
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       404:
 *         description: Reserva no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
export const deleteReservationController = async (req: Request, res: Response): Promise<void> => {
  // This function needs to be updated to use the new service logic
    res.status(511).json({ message: 'Not yet implemented' });
};

/**
 * @swagger
 * /reservations/view/calendar:
 *   get:
 *     summary: Obtiene datos de reservas para la vista de calendario.
 *     description: Retorna las reservas dentro de un rango de fechas para ser mostradas en un calendario.
 *     tags:
 *       - Reservas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de inicio del rango (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de fin del rango (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Datos de calendario obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   title:
 *                     type: string
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *                   # ... (otras propiedades relevantes para el calendario)
 *       400:
 *         description: startDate y endDate son requeridos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getCalendarViewDataController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ message: 'startDate and endDate are required query parameters' });
      return;
    }
    const data = await reservationService.getCalendarViewData(startDate as string, endDate as string);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar view data', error });
  }
};

/**
 * @swagger
 * /reservations/fix-end-times:
 *   post:
 *     summary: Corrige los tiempos de finalización de reservas.
 *     description: Una utilidad para ajustar los tiempos de finalización de reservas que puedan estar incorrectos.
 *     tags:
 *       - Reservas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tiempos de finalización de reservas corregidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fixedCount:
 *                   type: number
 *                   description: Número de reservas cuyos tiempos de finalización fueron corregidos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
export const fixReservationEndTimesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fixedCount } = await reservationService.fixReservationEndTimes();
    res.status(200).json({ message: `Fixed ${fixedCount} reservation end times.`, fixedCount });
  } catch (error) {
    console.error('Error in fixReservationEndTimesController:', error);
    res.status(500).json({ message: 'Error fixing reservation end times' });
  }
};