import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from "sequelize-typescript";
import { Area } from "./Area";
import { PartidaPresupuestal } from "./PartidaPresupuestal";

@Table({
  tableName: "presupuestos_anuales",
  indexes: [
    {
      unique: true,
      fields: ["anio", "mes", "areaId", "partidaId"],
    },
  ],
})
export class PresupuestoAnual extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare anio: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare mes: number;

  @Column({ type: DataType.STRING(120), allowNull: true })
  declare capitulo: string;

  @ForeignKey(() => Area)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare areaId: number;

  @BelongsTo(() => Area)
  declare area: Area;

  @ForeignKey(() => PartidaPresupuestal)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare partidaId: number;

  @BelongsTo(() => PartidaPresupuestal)
  declare partida: PartidaPresupuestal;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  declare montoAprobado: number;

  @Column({ type: DataType.DECIMAL(15, 2), defaultValue: 0 })
  declare montoEjercido: number;
<<<<<<< HEAD
}
=======
}
>>>>>>> b5e5bbf39d5a5ae50b88e6c49f0659594491b517
