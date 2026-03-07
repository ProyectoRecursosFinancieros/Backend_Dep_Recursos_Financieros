import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { PresupuestoAnual } from "./PresupuestoAnual";

@Table({
  tableName: "partidas_presupuestales",
})
export class PartidaPresupuestal extends Model {
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
  })
  declare codigo: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare nombre: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare descripcion?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare activa: boolean;

  @HasMany(() => PresupuestoAnual)
  declare presupuestos: PresupuestoAnual[];
}
