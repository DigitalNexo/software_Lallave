import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./database";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { apiLimiter } from "./middleware/rateLimiter"; // 🔹 Importamos el rate limiter

dotenv.config();

const app = express();

// 🔹 Middleware global UTF-8
app.use(express.json());
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    next();
});

// ✅ Aplicar Rate Limiting a TODAS las rutas de la API
app.use(apiLimiter);

// ✅ Inicializar servidor
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conectado a PostgreSQL correctamente");

        await sequelize.sync({ alter: true });
        console.log("✅ Base de datos sincronizada con Sequelize");

        app.use("/auth", authRoutes);
        app.use("/usuarios", userRoutes);

        app.get("/", (req: Request, res: Response) => {
            res.send("¡El backend está funcionando correctamente! 🚀");
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error en la inicialización del servidor:", error);
        process.exit(1);
    }
};

startServer();
