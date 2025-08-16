import { Request, Response } from 'express';
import {
  findByEmail,
  findById,
  updatePassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../services/user.service';
import {
  comparePassword,
  generateToken,
  hashPassword,
} from '../services/auth.service';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario.
 *     description: Autentica a un usuario con su email y contraseña, y retorna un token JWT y los datos del usuario.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario.
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna el token JWT y los datos del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token de autenticación JWT.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Email y/o contraseña son requeridos.
 *       401:
 *         description: Credenciales inválidas.
 *       500:
 *         description: Error interno del servidor.
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  console.log('Attempting login for email:', email);

  if (!email || !password) {
    res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    return;
  }

  try {
    const user = await findByEmail(email);
    console.log('User found by email:', user ? user.email : 'None');
    console.log('User password hash (from DB):', user ? user.password : 'None');

    if (!user || !user.password) {
      res.status(401).json({ message: 'Credenciales inválidas.' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    console.log('Is password valid (bcrypt compare result):', isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Credenciales inválidas.' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado.
 *     description: Retorna los datos del usuario actualmente autenticado.
 *     tags:
 *       - Autenticación
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de usuario obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: No autenticado. Token no proporcionado o inválido.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const getMeController = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'No autenticado.' });
    return;
  }
  try {
    const user = await findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Cambia la contraseña del usuario autenticado.
 *     description: Permite a un usuario autenticado cambiar su contraseña proporcionando la contraseña actual y la nueva.
 *     tags:
 *       - Autenticación
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Contraseña actual del usuario.
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña para el usuario.
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Contraseña actual y nueva son requeridas.
 *       401:
 *         description: No autenticado o contraseña actual incorrecta.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const changePasswordController = async (req: Request, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  if (!req.user) {
    res.status(401).json({ message: 'No autenticado.' });
    return;
  }
  if (!oldPassword || !newPassword) {
    res.status(400).json({ message: 'Contraseña actual y nueva son requeridas.' });
    return;
  }

  try {
    const user = await findByEmail(req.user.email); // findByEmail devuelve el hash del password
    if (!user || !user.password) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      res.status(401).json({ message: 'Contraseña actual incorrecta.' });
      return;
    }

    const newPasswordHash = await hashPassword(newPassword);
    await updatePassword(req.user.id, newPasswordHash);

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios.
 *     description: Retorna una lista de todos los usuarios registrados en el sistema. Requiere rol de administrador.
 *     tags:
 *       - Gestión de Usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente.
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
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos de administrador.
 *       500:
 *         description: Error interno del servidor.
 */
export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo usuario.
 *     description: Registra un nuevo usuario en el sistema. Requiere rol de administrador.
 *     tags:
 *       - Gestión de Usuarios
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
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email único del usuario.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario.
 *               role:
 *                 type: string
 *                 description: Rol del usuario (ej. 'administrador', 'barbero', 'cliente').
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Datos de entrada inválidos o incompletos.
 *       409:
 *         description: El email ya está registrado.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos de administrador.
 *       500:
 *         description: Error interno del servidor.
 */
export const createUserController = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ message: 'Nombre, email, contraseña y rol son requeridos.' });
    return;
  }

  try {
    const newUser = await createUser({ name, email, password, role });
    if ('error' in newUser) {
        res.status(409).json(newUser);
        return;
    }
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza un usuario existente.
 *     description: Actualiza los datos de un usuario específico por su ID. Requiere rol de administrador.
 *     tags:
 *       - Gestión de Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del usuario.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nuevo email del usuario.
 *               role:
 *                 type: string
 *                 description: Nuevo rol del usuario.
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Al menos un campo es requerido para actualizar.
 *       401:
 *         description: No autorizado. Token no proporcionado o inválido.
 *       403:
 *         description: Prohibido. El usuario no tiene permisos de administrador.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (!name && !email && !role) {
    res.status(400).json({ message: 'Al menos un campo es requerido para actualizar.' });
    return;
  }

  try {
    const updatedUser = await updateUser(Number(id), { name, email, role });
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor.';
    res.status(500).json({ message: errorMessage });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario.
 *     description: Elimina un usuario específico por su ID. Requiere rol de administrador.
 *     tags:
 *       - Gestión de Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario a eliminar.
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
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
 *         description: Prohibido. El usuario no tiene permisos de administrador.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deleted = await deleteUser(Number(id));
    if (deleted) {
      res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};