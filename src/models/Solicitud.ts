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
import { Usuario } from "./Usuario";
import { Requisicion } from "./Requisicion";

export enum EstadoSolicitud {
  BORRADOR = "BORRADOR",
  ENVIADA = "ENVIADA",
  AUTORIZADA = "AUTORIZADA",
  RECHAZADA = "RECHAZADA",
}

@Table({
  tableName: "solicitudes",
})
export class Solicitud extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare folio: string;

  @ForeignKey(() => Area)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare areaId: number;

  @BelongsTo(() => Area)
  declare area: Area;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare solicitanteId: number;

  @BelongsTo(() => Usuario)
  declare solicitante: Usuario;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare concepto: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare descripcionGeneral: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare monto: number;

  @Column({
    type: DataType.ENUM(...Object.values(EstadoSolicitud)),
    defaultValue: EstadoSolicitud.BORRADOR,
  })
  declare estado: EstadoSolicitud;

  // === NUEVO: OBSERVACIONES ===
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare observaciones?: string;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare autorizadoPorId?: number;

  @BelongsTo(() => Usuario, "autorizadoPorId")
  declare autorizadoPor?: Usuario;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare rechazadoPorId?: number;

  @BelongsTo(() => Usuario, "rechazadoPorId")
  declare rechazadoPor?: Usuario;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare fechaProcesamiento?: Date;

  @HasMany(() => Requisicion)
  declare requisiciones: Requisicion[];
}