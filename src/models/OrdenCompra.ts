import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { Requisicion } from "./Requisicion";
import { Proveedor } from "./Proveedor";
import { OrdenPago } from "./OrdenPago";

export enum TipoContratacion {
  DIRECTA = "DIRECTA",
  INVITACION = "INVITACION",
  LICITACION = "LICITACION",
}

@Table({
  tableName: "ordenes_compra",
})
export class OrdenCompra extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare numeroOrden: string;

  @ForeignKey(() => Requisicion)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare requisicionId: number;

  @BelongsTo(() => Requisicion)
  declare requisicion: Requisicion;

  @ForeignKey(() => Proveedor)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare proveedorId: number;

  @BelongsTo(() => Proveedor)
  declare proveedor: Proveedor;

  @Column({
    type: DataType.ENUM(...Object.values(TipoContratacion)),
    allowNull: false,
  })
  declare tipoContratacion: TipoContratacion;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare total: number;

  @HasMany(() => OrdenPago)
  declare pagos: OrdenPago[];
}
