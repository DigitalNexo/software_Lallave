import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import User from "../models/User";
import { login, refreshToken, logout } from "../controllers/authController";
import { loginLimiter } from "../middleware/rateLimiter"; // Importa el limitador

const router = Router();

// 🔹 Aplicar el limitador en la ruta de login
router.post("/login", loginLimiter, login);

// Endpoint para refrescar token
router.post("/refresh", refreshToken);

// Endpoint para cerrar sesión
router.post("/logout", logout);

// Obtener datos del usuario autenticado
router.get("/me", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] }, // No devolver la contraseña
        });

        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error("Error al obtener usuario autenticado:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
});

export default router;