import { DataTypes, Model } from "sequelize";
import sequelize from "../database";

class User extends Model {
    public id!: number;
    public nombre!: string;
    public email!: string;
    public password!: string;
    public rol!: "gestor" | "cliente";
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rol: {
            type: DataTypes.ENUM("gestor", "cliente"),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "usuarios",
        timestamps: true, // Agrega createdAt y updatedAt automáticamente
    }
);

export default User;