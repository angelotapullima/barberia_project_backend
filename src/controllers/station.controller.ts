import { Request, Response } from 'express';
import {
  getAllStations,
  createStation,
  updateStation,
  deleteStation,
} from '../services/station.service';

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: Obtiene todas las estaciones.
 *     description: Retorna una lista de todas las estaciones de trabajo disponibles.
 *     tags:
 *       - Estaciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estaciones obtenida exitosamente.
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
 *                   description:
 *                     type: string
 *                   is_active:
 *                     type: boolean
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getAllStationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const stations = await getAllStations();
    res.json(stations);
  } catch (error) {
    console.error('Error getting stations:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /stations:
 *   post:
 *     summary: Crea una nueva estación.
 *     description: Añade una nueva estación de trabajo.
 *     tags:
 *       - Estaciones
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la estación.
 *               description:
 *                 type: string
 *                 description: Descripción de la estación (opcional).
 *     responses:
 *       201:
 *         description: Estación creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 is_active:
 *                   type: boolean
 *       400:
 *         description: El nombre es requerido o datos inválidos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
export const createStationController = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ message: 'El nombre es requerido' });
    return;
  }
  try {
    const newStation = await createStation({ name, description, is_active: true });
    if ('error' in newStation) {
      res.status(400).json(newStation);
      return;
    }
    res.status(201).json(newStation);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /stations/{id}:
 *   put:
 *     summary: Actualiza una estación existente.
 *     description: Actualiza los detalles de una estación específica por su ID.
 *     tags:
 *       - Estaciones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la estación a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre de la estación.
 *               description:
 *                 type: string
 *                 description: Nueva descripción de la estación (opcional).
 *               is_active:
 *                 type: boolean
 *                 description: Estado de actividad de la estación (opcional).
 *     responses:
 *       200:
 *         description: Estación actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 is_active:
 *                   type: boolean
 *       400:
 *         description: El nombre es requerido o datos inválidos.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       404:
 *         description: Estación no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
export const updateStationController = async (req: Request, res: Response): Promise<void> => {
  const { name, description, is_active } = req.body;
  const { id } = req.params;
  if (!name) {
    res.status(400).json({ message: 'El nombre es requerido' });
    return;
  }
  try {
    const updatedStation = await updateStation(Number(id), {
      name,
      description,
      is_active,
    });
    if (!updatedStation) {
      res.status(404).json({ message: 'Estación no encontrada' });
      return;
    }
    if ('error' in updatedStation) {
      res.status(400).json(updatedStation);
      return;
    }
    res.status(200).json(updatedStation);
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /stations/{id}:
 *   delete:
 *     summary: Elimina una estación.
 *     description: Elimina una estación específica por su ID.
 *     tags:
 *       - Estaciones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la estación a eliminar.
 *     responses:
 *       204:
 *         description: Estación eliminada exitosamente.
 *       400:
 *         description: Error al eliminar la estación.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       404:
 *         description: Estación no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
export const deleteStationController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await deleteStation(Number(id));
    if (result && 'error' in result) {
      res.status(400).json(result);
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
