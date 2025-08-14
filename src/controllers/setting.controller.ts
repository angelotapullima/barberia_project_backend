import { Request, Response } from 'express';
import {
  getSetting,
  setSetting,
  getAllSettings,
} from '../services/setting.service';

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

export const getAllSettingsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getAllSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error al obtener todas las configuraciones:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};