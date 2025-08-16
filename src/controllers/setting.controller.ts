import { Request, Response } from 'express';
import {
  getSetting,
  setSetting,
  getAllSettings,
} from '../services/setting.service';

/**
 * @swagger
 * /settings/{key}:
 *   get:
 *     summary: Obtiene una configuración específica por su clave.
 *     description: Retorna el valor de una configuración del sistema.
 *     tags:
 *       - Configuración
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clave de la configuración a obtener.
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: string
 *                 description: El valor de la configuración.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       404:
 *         description: Configuración no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
export const getSettingController = async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;
  try {
    const value = await getSetting(key);
    if (value !== undefined) {
      res.status(200).json({ [key]: value });
    } else {
      res.status(404).json({ message: 'Configuración no encontrada.' });
    }
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Actualiza múltiples configuraciones.
 *     description: Actualiza una o varias configuraciones del sistema. El cuerpo de la petición debe ser un objeto con pares clave-valor.
 *     tags:
 *       - Configuración
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *               description: El valor de la configuración.
 *             example:
 *               nombre_barberia: "Mi Barbería"
 *               horario_apertura: "09:00"
 *     responses:
 *       200:
 *         description: Configuraciones actualizadas exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: El cuerpo de la petición debe ser un objeto con clave-valor.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para realizar esta acción.
 *       500:
 *         description: Error interno del servidor.
 */
export const updateSettingController = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = req.body;
    if (typeof settings !== 'object' || settings === null) {
        res.status(400).json({ message: 'El cuerpo de la petición debe ser un objeto con clave-valor.' });
        return;
    }

    for (const key in settings) {
        if (Object.prototype.hasOwnProperty.call(settings, key)) {
            await setSetting(key, settings[key]);
        }
    }
    res.status(200).json({ message: 'Configuraciones actualizadas exitosamente.' });

  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Obtiene todas las configuraciones del sistema.
 *     description: Retorna un objeto con todas las configuraciones clave-valor del sistema.
 *     tags:
 *       - Configuración
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las configuraciones obtenidas exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: string
 *                 description: El valor de la configuración.
 *               example:
 *                 nombre_barberia: "Mi Barbería"
 *                 horario_apertura: "09:00"
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos para acceder a este recurso.
 *       500:
 *         description: Error interno del servidor.
 */
export const getAllSettingsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getAllSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error al obtener todas las configuraciones:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
