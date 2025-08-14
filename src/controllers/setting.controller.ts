import { Request, Response } from 'express';
import { settingService } from '../services/setting.service';

class SettingController {
  public async getSetting(req: Request, res: Response): Promise<void> {
    const { key } = req.params;
    try {
      const value = await settingService.getSetting(key);
      if (value !== undefined) {
        res.status(200).json({ setting_key: key, setting_value: value });
      } else {
        res.status(404).json({ message: 'Configuración no encontrada.' });
      }
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  public async updateSetting(req: Request, res: Response): Promise<void> {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      res
        .status(400)
        .json({ message: 'El valor de la configuración es requerido.' });
      return;
    }

    try {
      const updated = await settingService.setSetting(key, value);
      if (updated) {
        res
          .status(200)
          .json({ message: 'Configuración actualizada exitosamente.' });
      } else {
        res
          .status(500)
          .json({ message: 'No se pudo actualizar la configuración.' });
      }
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  public async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await settingService.getAllSettings();
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error al obtener todas las configuraciones:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
}

export const settingController = new SettingController();
