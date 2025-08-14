import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';

class AuthController {
  public async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos.' });
      return;
    }

    try {
      const user = await userService.findByEmail(email);

      if (!user) {
        res.status(401).json({ message: 'Credenciales inválidas.' });
        return;
      }

      const isPasswordValid = await authService.comparePassword(
        password,
        user.password || '',
      );

      if (!isPasswordValid) {
        res.status(401).json({ message: 'Credenciales inválidas.' });
        return;
      }

      // Generar token JWT
      const token = authService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res
        .status(200)
        .json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
    } catch (error) {
      console.error('Error en el login:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  public async getMe(req: Request, res: Response): Promise<void> {
    // El middleware authenticateToken ya adjuntó la información del usuario a req.user
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado.' });
      return;
    }
    try {
      const user = await userService.findById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado.' });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    const { oldPassword, newPassword } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'No autenticado.' });
      return;
    }
    if (!oldPassword || !newPassword) {
      res
        .status(400)
        .json({
          message: 'Contraseña actual y nueva contraseña son requeridas.',
        });
      return;
    }

    try {
      const user = await userService.findById(req.user.id);
      if (!user || !user.password) {
        res
          .status(404)
          .json({
            message: 'Usuario no encontrado o contraseña no establecida.',
          });
        return;
      }

      const isOldPasswordValid = await authService.comparePassword(
        oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        res.status(401).json({ message: 'Contraseña actual incorrecta.' });
        return;
      }

      const newPasswordHash = await authService.hashPassword(newPassword);
      const updated = await userService.updatePassword(
        req.user.id,
        newPasswordHash,
      );

      if (updated) {
        res
          .status(200)
          .json({ message: 'Contraseña actualizada exitosamente.' });
      } else {
        res
          .status(500)
          .json({ message: 'No se pudo actualizar la contraseña.' });
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  // --- Métodos para Gestión de Usuarios (CRUD) ---

  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res
        .status(400)
        .json({ message: 'Nombre, email, contraseña y rol son requeridos.' });
      return;
    }

    try {
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ message: 'El email ya está registrado.' });
        return;
      }

      const hashedPassword = await authService.hashPassword(password);
      const newUser = await userService.createUser({
        name,
        email,
        password_hash: hashedPassword,
        role,
      });
      res
        .status(201)
        .json({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name && !email && !role) {
      res
        .status(400)
        .json({
          message:
            'Al menos un campo (nombre, email, rol) es requerido para actualizar.',
        });
      return;
    }

    try {
      const updated = await userService.updateUser(Number(id), {
        name,
        email,
        role,
      });
      if (updated) {
        res.status(200).json({ message: 'Usuario actualizado exitosamente.' });
      } else {
        res.status(404).json({ message: 'Usuario no encontrado.' });
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const deleted = await userService.deleteUser(Number(id));
      if (deleted) {
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
      } else {
        res.status(404).json({ message: 'Usuario no encontrado.' });
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
}

export const authController = new AuthController();
