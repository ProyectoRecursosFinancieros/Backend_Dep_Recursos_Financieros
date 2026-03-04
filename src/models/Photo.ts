import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "photos" })
export class Photo extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare imagePath: string;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  declare latitude: number;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  declare longitude: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare address: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare capturedAt: Date;
}
