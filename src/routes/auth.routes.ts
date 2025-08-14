import { Router } from 'express';
import {
  loginController,
  getMeController,
  changePasswordController,
  getAllUsersController,
  createUserController,
  updateUserController,
  deleteUserController,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorization.middleware';

const router = Router();

// Rutas de autenticación y perfil
router.post('/login', loginController);
router.get('/me', authenticateToken, getMeController);
router.put('/change-password', authenticateToken, changePasswordController);

// Rutas de gestión de usuarios (solo para administradores)
const usersRouter = Router();
usersRouter.use(authenticateToken, authorizeRoles('administrador'));

usersRouter.get('/', getAllUsersController);
usersRouter.post('/', createUserController);
usersRouter.put('/:id', updateUserController);
usersRouter.delete('/:id', deleteUserController);

// Montar el router de usuarios bajo el prefijo /users
router.use('/users', usersRouter);

export default router;