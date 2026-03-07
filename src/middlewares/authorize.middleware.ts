import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  };
};
