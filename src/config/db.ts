import { Sequelize } from "sequelize-typescript";
import colors from "colors";
import dotenv from "dotenv";
import { Area } from "../models/Area";
import { Usuario } from "../models/Usuario";
import { PartidaPresupuestal } from "../models/PartidaPresupuestal";
import { PresupuestoAnual } from "../models/PresupuestoAnual";
import { Solicitud } from "../models/Solicitud";
import { Requisicion } from "../models/Requisicion";
import { RequisicionDetalle } from "../models/RequisicionDetalle";
import { Proveedor } from "../models/Proveedor";
import { OrdenPago } from "../models/OrdenPago";
import { OrdenCompra } from "../models/OrdenCompra";
import { MovimientoPresupuestal } from "../models/MovimientoPresupuestal";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    ssl: true,
    models: [
      Area,
      Usuario,
      PartidaPresupuestal,
      PresupuestoAnual,
      Solicitud,
      Requisicion,
      RequisicionDetalle,
      Proveedor,
      OrdenPago,
      OrdenCompra,
      MovimientoPresupuestal,
    ],
  },
);

export const connectDatabase = async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  console.log(
    colors.magenta.italic.bold("Base de datos conectada exitosamente!"),
  );
};
