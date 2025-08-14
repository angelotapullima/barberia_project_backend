import { Request, Response, NextFunction } from 'express';

// Extender la interfaz Request para asegurar que req.user esté tipado
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string };
    }
  }
}

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: 'No autenticado o rol no definido.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: 'Acceso denegado. No tienes los permisos necesarios.',
        });
    }

    next();
  };
};
