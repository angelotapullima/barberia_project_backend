import { Request, Response } from 'express';
import * as service from '../services/service.service';

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Obtiene todos los servicios.
 *     description: Retorna una lista de todos los servicios disponibles en el sistema.
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   durationMinutes:
 *                     type: number
 *                   # ... (otras propiedades del servicio)
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getAllServicesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await service.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
};

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Obtiene un servicio por su ID.
 *     description: Retorna los detalles de un servicio específico.
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servicio a obtener.
 *     responses:
 *       200:
 *         description: Servicio obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 durationMinutes:
 *                   type: number
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       404:
 *         description: Servicio no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const getServiceByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await service.getServiceById(id);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service', error });
  }
};

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Crea un nuevo servicio.
 *     description: Añade un nuevo servicio a la lista de servicios ofrecidos.
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - durationMinutes
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del servicio.
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Precio del servicio.
 *               durationMinutes:
 *                 type: integer
 *                 description: Duración del servicio en minutos.
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 durationMinutes:
 *                   type: number
 *       400:
 *         description: Datos de entrada inválidos o incompletos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
export const createServiceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const newService = await service.createService(req.body);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service', error });
  }
};

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Actualiza un servicio existente.
 *     description: Actualiza los detalles de un servicio específico por su ID.
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servicio a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del servicio.
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Nuevo precio del servicio.
 *               durationMinutes:
 *                 type: integer
 *                 description: Nueva duración del servicio en minutos.
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 durationMinutes:
 *                   type: number
 *       400:
 *         description: Datos de entrada inválidos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       404:
 *         description: Servicio no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const updateServiceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedService = await service.updateService(id, req.body);
    if (updatedService) {
      res.status(200).json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error });
  }
};

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Desactiva un servicio.
 *     description: Marca un servicio como inactivo en lugar de eliminarlo permanentemente.
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servicio a desactivar.
 *     responses:
 *       200:
 *         description: Servicio desactivado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       404:
 *         description: Servicio no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const deleteServiceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const deletedService = await service.deleteService(id);
    if (deletedService) {
      res.status(200).json({ message: 'Service deactivated successfully' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating service', error });
  }
};