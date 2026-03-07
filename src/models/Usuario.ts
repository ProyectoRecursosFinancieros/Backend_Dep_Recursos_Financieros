import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Area } from "./Area";

export enum RolUsuario {
  ADMIN = "ADMIN",
  PRESUPUESTO = "PRESUPUESTO",
  PLANEACION = "PLANEACION",
  MATERIALES = "MATERIALES",
  AREA = "AREA",
}

@Table({
  tableName: "usuarios",
})
export class Usuario extends Model {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare nombre: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.ENUM(...Object.values(RolUsuario)),
    allowNull: false,
  })
  declare rol: RolUsuario;

  @ForeignKey(() => Area)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare areaId: number;

  @BelongsTo(() => Area)
  declare area: Area;
}
