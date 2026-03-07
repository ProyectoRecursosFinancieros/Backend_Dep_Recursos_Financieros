import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { OrdenCompra } from "./OrdenCompra";
import { Usuario } from "./Usuario";

export enum EstadoPago {
  PENDIENTE = "PENDIENTE",
  PAGADO = "PAGADO",
  CANCELADO = "CANCELADO",
}

@Table({
  tableName: "ordenes_pago",
})
export class OrdenPago extends Model {
  @ForeignKey(() => OrdenCompra)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare ordenCompraId: number;

  @BelongsTo(() => OrdenCompra)
  declare ordenCompra: OrdenCompra;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare monto: number;

  @Column({
    type: DataType.ENUM(...Object.values(EstadoPago)),
    defaultValue: EstadoPago.PENDIENTE,
  })
  declare estado: EstadoPago;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare autorizadoPorId?: number;

  @BelongsTo(() => Usuario)
  declare autorizadoPor?: Usuario;
}
