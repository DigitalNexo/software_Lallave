import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST!,
    dialect: "postgres",
    dialectOptions: {
        charset: "utf8",
        useUTC: false, // Permite manejar correctamente fechas en local
        dateStrings: true,
    },
    timezone: "Europe/Madrid", // Ajusta esto según tu zona horaria
});

export default sequelize;