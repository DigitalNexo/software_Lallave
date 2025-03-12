import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { authenticateJWT } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

const router = Router();

// 🔹 Crear usuario (Todos pueden registrarse)
router.post("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, email, password, rol } = req.body;
        if (!nombre || !email || !password || !rol) {
            res.status(400).json({ error: "Todos los campos son obligatorios" });
            return;
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ nombre, email, password: hashedPassword, rol });
        res.status(201).json(user);
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

// 🔍 Obtener todos los usuarios con filtros y paginación (Solo gestores pueden acceder)
router.get("/", authenticateJWT, authorizeRole(["gestor"]), async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, email, page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 10;
        const offset = (pageNumber - 1) * limitNumber;

        const whereClause: any = {};
        if (nombre) whereClause.nombre = { $like: `%${nombre}%` };
        if (email) whereClause.email = { $like: `%${email}%` };

        const { rows: users, count } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ["password"] }, // No devolver contraseñas
            limit: limitNumber,
            offset,
        });

        res.json({
            total: count,
            page: pageNumber,
            totalPages: Math.ceil(count / limitNumber),
            users,
        });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
});

// 🔹 Obtener todos los usuarios (Solo "gestor" puede verlos)
router.get("/", authenticateJWT, authorizeRole(["gestor"]), async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password"] }, // No devolver contraseñas
        });
        res.json(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
});

// 🔹 Obtener un usuario por ID (Gestor puede ver todos, Cliente solo su perfil)
router.get("/:id", authenticateJWT, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id);
        const authUser = (req as any).user;

        // Si es "cliente", solo puede ver su propio perfil
        if (authUser.rol === "cliente" && authUser.id !== userId) {
            res.status(403).json({ error: "Acceso denegado." });
            return;
        }

        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
});

// 🔹 Actualizar usuario (Gestor puede modificar cualquier usuario, Cliente solo su perfil)
router.put("/:id", authenticateJWT, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const { nombre, email, password, rol } = req.body;
        const userId = parseInt(req.params.id);
        const authUser = (req as any).user;

        // Si es cliente, solo puede modificar su propio perfil y no puede cambiar su rol
        if (authUser.rol === "cliente" && authUser.id !== userId) {
            res.status(403).json({ error: "Acceso denegado." });
            return;
        }

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        // Encriptar la nueva contraseña antes de actualizarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Si es cliente, evitar que cambie su rol
        if (authUser.rol === "cliente") {
            await user.update({ nombre, email, password: hashedPassword });
        } else {
            await user.update({ nombre, email, password: hashedPassword, rol });
        }

        res.json(user);
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

// 🔹 Eliminar usuario (Solo "gestor" puede eliminar cualquier usuario)
router.delete("/:id", authenticateJWT, authorizeRole(["gestor"]), async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        await user.destroy();
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

export default router;