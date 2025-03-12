"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const authorizeRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            res.status(403).json({ error: "Acceso denegado. No tienes permisos." });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
