import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { Area } from "./Area";
import { PartidaPresupuestal } from "./PartidaPresupuestal";
import { MovimientoPresupuestal } from "./MovimientoPresupuestal";

@Table({
  tableName: "presupuestos_anuales",
})
export class PresupuestoAnual extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare anio: number;

  @ForeignKey(() => Area)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare areaId: number;

  @BelongsTo(() => Area)
  declare area: Area;

  @ForeignKey(() => PartidaPresupuestal)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare partidaId: number;

  @BelongsTo(() => PartidaPresupuestal)
  declare partida: PartidaPresupuestal;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare montoAprobado: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    defaultValue: 0,
  })
  declare montoEjercido: number;

  @HasMany(() => MovimientoPresupuestal)
  declare movimientos: MovimientoPresupuestal[];
}
