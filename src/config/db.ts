import { Sequelize } from "sequelize-typescript";
import colors from "colors";
import dotenv from "dotenv";

dotenv.config();

const database = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    ssl: true,
  },
);

export const connectDatabase = async () => {
  await database.authenticate();
  await database.sync();

  console.log(
    colors.magenta.italic.bold("Base de datos conectada exitosamente!"),
  );
};
