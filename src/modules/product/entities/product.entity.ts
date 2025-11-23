import { BaseModel } from '@libraries/baseModel.entity';
import { Column, DataType, Table } from 'sequelize-typescript';

@Table({
  tableName: 'product',
})
export class Product extends BaseModel<Product> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;
}
