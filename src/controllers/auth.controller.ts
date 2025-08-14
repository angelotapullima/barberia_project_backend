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

export const loginController = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    return;
  }

  try {
    const user = await findByEmail(email);
    if (!user || !user.password) {
      res.status(401).json({ message: 'Credenciales inválidas.' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
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

// --- User Management ---

export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

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