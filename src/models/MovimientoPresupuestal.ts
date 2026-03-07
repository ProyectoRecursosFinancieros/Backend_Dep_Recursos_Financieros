import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { PresupuestoAnual } from "./PresupuestoAnual";
import { Usuario } from "./Usuario";

export enum TipoMovimiento {
  AMPLIACION = "AMPLIACION",
  REDUCCION = "REDUCCION",
  TRANSFERENCIA = "TRANSFERENCIA",
}

@Table({
  tableName: "movimientos_presupuestales",
})
export class MovimientoPresupuestal extends Model {
  @ForeignKey(() => PresupuestoAnual)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare presupuestoId: number;

  @BelongsTo(() => PresupuestoAnual)
  declare presupuesto: PresupuestoAnual;

  @Column({
    type: DataType.ENUM(...Object.values(TipoMovimiento)),
    allowNull: false,
  })
  declare tipo: TipoMovimiento;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare monto: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare motivo: string;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare autorizadoPorId: number;

  @BelongsTo(() => Usuario)
  declare autorizadoPor: Usuario;
}
