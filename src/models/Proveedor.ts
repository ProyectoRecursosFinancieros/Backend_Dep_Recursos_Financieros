import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { OrdenCompra } from "./OrdenCompra";

export enum TipoPersona {
  FISICA = "FISICA",
  MORAL = "MORAL",
}

@Table({
  tableName: "proveedores",
})
export class Proveedor extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare nombre: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare rfc: string;

  @Column(DataType.STRING)
  declare direccion?: string;

  @Column(DataType.STRING)
  declare telefono?: string;

  @Column(DataType.STRING)
  declare email?: string;

  @Column({
    type: DataType.ENUM(...Object.values(TipoPersona)),
    allowNull: false,
  })
  declare tipoPersona: TipoPersona;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare activo: boolean;

  @HasMany(() => OrdenCompra)
  declare ordenesCompra: OrdenCompra[];
}
