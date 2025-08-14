import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

// Extender la interfaz Request para incluir la propiedad user
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }

  const decoded = authService.verifyToken(token);

  if (!decoded) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }

  req.user = decoded; // Adjuntar la información del usuario a la solicitud
  next();
};
