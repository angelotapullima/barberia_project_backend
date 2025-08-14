import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorization.middleware';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.put(
  '/change-password',
  authenticateToken,
  authController.changePassword,
);

// Rutas de gestión de usuarios (solo para administradores)
router.get(
  '/users',
  authenticateToken,
  authorizeRoles('administrador'),
  authController.getAllUsers,
);
router.post(
  '/users',
  authenticateToken,
  authorizeRoles('administrador'),
  authController.createUser,
);
router.put(
  '/users/:id',
  authenticateToken,
  authorizeRoles('administrador'),
  authController.updateUser,
);
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRoles('administrador'),
  authController.deleteUser,
);

export default router;
