import { Request, Response, NextFunction } from "express";
import { authenticateJWT } from "./authMiddleware";

interface AuthRequest extends Request {
    user?: { id: number; email: string; rol: string };
}

// Middleware para verificar el rol de usuario
export const authorizeRole = (rolesPermitidos: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            res.status(403).json({ error: "Acceso denegado. No tienes permisos." });
            return;
        }
        next();
    };
};
