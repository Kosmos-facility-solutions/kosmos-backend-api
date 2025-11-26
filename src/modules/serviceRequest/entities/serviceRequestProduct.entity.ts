import { BaseModel } from '@libraries/baseModel.entity';
import { Product } from '@modules/product/entities/product.entity';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { ServiceRequest } from './serviceRequest.entity';

@Table({
  tableName: 'service_request_product',
})
export class ServiceRequestProduct extends BaseModel<ServiceRequestProduct> {
  @ForeignKey(() => ServiceRequest)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: 'service_request_product_unique',
  })
  serviceRequestId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: 'service_request_product_unique',
  })
  productId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  quantity: number;

  @BelongsTo(() => ServiceRequest)
  serviceRequest: ServiceRequest;

  @BelongsTo(() => Product)
  product: Product;
}
