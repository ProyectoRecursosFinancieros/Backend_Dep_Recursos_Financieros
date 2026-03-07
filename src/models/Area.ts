import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Usuario } from "./Usuario";

@Table({
  tableName: "areas",
})
export class Area extends Model {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare nombre: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare descripcion?: string;

  @HasMany(() => Usuario)
  declare usuarios: Usuario[];
}
