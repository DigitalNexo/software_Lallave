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
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const router = (0, express_1.Router)();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, email, password, rol } = req.body;
        if (!nombre || !email || !password || !rol) {
            res.status(400).json({ error: "Todos los campos son obligatorios" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield User_1.default.create({ nombre, email, password: hashedPassword, rol });
        res.status(201).json(user);
    }
    catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
}));
router.get("/", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRole)(["gestor"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.findAll({
            attributes: { exclude: ["password"] },
        });
        res.json(users);
    }
    catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
}));
router.get("/:id", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        const authUser = req.user;
        if (authUser.rol === "cliente" && authUser.id !== userId) {
            res.status(403).json({ error: "Acceso denegado." });
            return;
        }
        const user = yield User_1.default.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
}));
router.put("/:id", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, email, password, rol } = req.body;
        const userId = parseInt(req.params.id);
        const authUser = req.user;
        if (authUser.rol === "cliente" && authUser.id !== userId) {
            res.status(403).json({ error: "Acceso denegado." });
            return;
        }
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        if (authUser.rol === "cliente") {
            yield user.update({ nombre, email, password: hashedPassword });
        }
        else {
            yield user.update({ nombre, email, password: hashedPassword, rol });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
}));
router.delete("/:id", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRole)(["gestor"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByPk(req.params.id);
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        yield user.destroy();
        res.json({ message: "Usuario eliminado correctamente" });
    }
    catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
}));
exports.default = router;
