import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secreto";
const TOKEN_EXPIRATION = "2h";
const REFRESH_TOKEN_EXPIRATION = "7d";
const revokedTokens = new Set<string>();

// 🔐 Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email y contraseña son obligatorios." });
            return;
        }

        // Buscar usuario por email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ error: "Credenciales incorrectas." });
            return;
        }

        // Verificar la contraseña encriptada
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: "Credenciales incorrectas." });
            return;
        }

        // Generar tokens de acceso y refresh
        const token = generateAccessToken(user.id, user.email, user.rol);
        const refreshToken = generateRefreshToken(user.id);

        res.json({ token, refreshToken, user: { id: user.id, email: user.email, rol: user.rol } });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
};

// 🔄 Refrescar Token de Acceso
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token es obligatorio." });
            return;
        }

        // Verificar si el token ha sido revocado
        if (revokedTokens.has(refreshToken)) {
            res.status(403).json({ error: "Refresh token inválido o revocado." });
            return;
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;
        } catch (err) {
            res.status(403).json({ error: "Token inválido o expirado." });
            return;
        }

        if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
            res.status(400).json({ error: "Refresh token inválido." });
            return;
        }

        // Generar un nuevo token de acceso
        const newToken = generateAccessToken(decoded.id as number);

        res.json({ token: newToken });
    } catch (error) {
        console.error("Error al refrescar token:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
};

// 🚪 Cerrar Sesión (Revocar Token)
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token es obligatorio." });
            return;
        }

        // Revocar el token para que no pueda reutilizarse
        revokedTokens.add(refreshToken);

        res.json({ message: "Logout exitoso, el refresh token ha sido eliminado." });
    } catch (error) {
        console.error("Error en logout:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
};

// 🔑 Función para generar un token de acceso
const generateAccessToken = (id: number, email?: string, rol?: string): string => {
    return jwt.sign({ id, email, rol }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

// 🔄 Función para generar un refresh token
const generateRefreshToken = (id: number): string => {
    return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};