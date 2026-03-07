import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Requisicion } from "./Requisicion";

@Table({
  tableName: "requisicion_detalles",
})
export class RequisicionDetalle extends Model {
  @ForeignKey(() => Requisicion)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare requisicionId: number;

  @BelongsTo(() => Requisicion)
  declare requisicion: Requisicion;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare descripcion: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare cantidad: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare precioUnitario: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare subtotal: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    defaultValue: 0,
  })
  declare impuestos: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    defaultValue: 0,
  })
  declare retenciones: number;
}
