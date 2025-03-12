"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secreto";
const TOKEN_EXPIRATION = "2h";
const REFRESH_TOKEN_EXPIRATION = "7d";
const revokedTokens = new Set();
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email y contraseña son obligatorios." });
            return;
        }
        const user = yield User_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ error: "Credenciales incorrectas." });
            return;
        }
        const validPassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: "Credenciales incorrectas." });
            return;
        }
        const token = generateAccessToken(user.id, user.email, user.rol);
        const refreshToken = generateRefreshToken(user.id);
        res.json({ token, refreshToken, user: { id: user.id, email: user.email, rol: user.rol } });
    }
    catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token es obligatorio." });
            return;
        }
        if (revokedTokens.has(refreshToken)) {
            res.status(403).json({ error: "Refresh token inválido o revocado." });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
        }
        catch (err) {
            res.status(403).json({ error: "Token inválido o expirado." });
            return;
        }
        if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
            res.status(400).json({ error: "Refresh token inválido." });
            return;
        }
        const newToken = generateAccessToken(decoded.id);
        res.json({ token: newToken });
    }
    catch (error) {
        console.error("Error al refrescar token:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
});
exports.refreshToken = refreshToken;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token es obligatorio." });
            return;
        }
        revokedTokens.add(refreshToken);
        res.json({ message: "Logout exitoso, el refresh token ha sido eliminado." });
    }
    catch (error) {
        console.error("Error en logout:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
});
exports.logout = logout;
const generateAccessToken = (id, email, rol) => {
    return jsonwebtoken_1.default.sign({ id, email, rol }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};
