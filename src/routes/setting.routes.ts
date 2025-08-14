import { Router } from 'express';
import {
  getAllSettingsController,
  getSettingController,
  updateSettingController,
} from '../controllers/setting.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorization.middleware';

const router = Router();

// Aplicar middleware a todas las rutas de este fichero
router.use(authenticateToken, authorizeRoles('administrador'));

router.get('/', getAllSettingsController);
router.put('/', updateSettingController); // Cambiado a PUT en la raíz para actualizar múltiples configuraciones
router.get('/:key', getSettingController);

export default router;