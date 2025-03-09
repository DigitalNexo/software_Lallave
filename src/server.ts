import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./database"; // Importamos la conexión a la base de datos
import User from "./models/User"; // Importamos el modelo de usuario
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config(); // Carga las variables de entorno

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/auth", authRoutes);

// Verificar conexión a la base de datos antes de cargar rutas
(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conectado a PostgreSQL correctamente");

        await sequelize.sync({ alter: true }); // ✅ Mantiene los datos, solo ajusta la estructura si hay cambios
        console.log("✅ Base de datos sincronizada con Sequelize");

        // Cargar rutas después de la conexión a la base de datos
        app.use("/usuarios", userRoutes);

        // Ruta de prueba
        app.get("/", (req: Request, res: Response) => {
            res.send("¡El backend está funcionando! 🚀");
        });

        app.use("/auth", authRoutes);
        // Iniciar el servidor solo si la conexión fue exitosa
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Error en la inicialización del servidor:", error);
        process.exit(1); // Salir del proceso si hay un error crítico
    }
})();
