import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { Solicitud } from "./Solicitud";
import { PresupuestoAnual } from "./PresupuestoAnual";
import { Usuario } from "./Usuario";
import { RequisicionDetalle } from "./RequisicionDetalle";
import { OrdenCompra } from "./OrdenCompra";

export enum EstadoRequisicion {
  PENDIENTE = "PENDIENTE",
  AUTORIZADA = "AUTORIZADA",
  CANCELADA = "CANCELADA",
}

@Table({
  tableName: "requisiciones",
})
export class Requisicion extends Model {
  @ForeignKey(() => Solicitud)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare solicitudId: number;

  @BelongsTo(() => Solicitud)
  declare solicitud: Solicitud;

  @ForeignKey(() => PresupuestoAnual)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare presupuestoId: number;

  @BelongsTo(() => PresupuestoAnual)
  declare presupuesto: PresupuestoAnual;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare total: number;

  @Column({
    type: DataType.ENUM(...Object.values(EstadoRequisicion)),
    defaultValue: EstadoRequisicion.PENDIENTE,
  })
  declare estado: EstadoRequisicion;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare autorizadoPorId?: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare fechaAutorizacion?: Date;

  @BelongsTo(() => Usuario)
  declare autorizadoPor?: Usuario;

  @HasMany(() => RequisicionDetalle)
  declare detalles: RequisicionDetalle[];

  @HasMany(() => OrdenCompra)
  declare ordenesCompra: OrdenCompra[];
}
