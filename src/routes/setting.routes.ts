import { Router } from 'express';
import { settingController } from '../controllers/setting.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorization.middleware';

const router = Router();

// Todas las rutas de configuración requieren autenticación y rol de administrador
router.get(
  '/',
  authenticateToken,
  authorizeRoles('administrador'),
  settingController.getAllSettings,
);
router.get(
  '/:key',
  authenticateToken,
  authorizeRoles('administrador'),
  settingController.getSetting,
);
router.put(
  '/:key',
  authenticateToken,
  authorizeRoles('administrador'),
  settingController.updateSetting,
);

export default router;
