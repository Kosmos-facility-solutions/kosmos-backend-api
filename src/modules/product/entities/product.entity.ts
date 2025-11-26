import { BaseModel } from '@libraries/baseModel.entity';
import { ServiceRequest } from '@modules/serviceRequest/entities/serviceRequest.entity';
import { ServiceRequestProduct } from '@modules/serviceRequest/entities/serviceRequestProduct.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { BelongsToMany, Column, DataType, Table } from 'sequelize-typescript';

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

  @ApiHideProperty()
  @BelongsToMany(() => ServiceRequest, {
    through: {
      model: () => ServiceRequestProduct,
      unique: false,
    },
    foreignKey: 'productId',
    otherKey: 'serviceRequestId',
  })
  serviceRequests: ServiceRequest[];
}
