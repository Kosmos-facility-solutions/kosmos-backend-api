import { BaseModel } from '@libraries/baseModel.entity';
import { Property } from '@modules/property/entities/property.entity';
import { Product } from '@modules/product/entities/product.entity';
import { Service } from '@modules/service/entities/service.entity';
import { User } from '@modules/user/entities/user.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { ServiceRequestProduct } from './serviceRequestProduct.entity';

export enum ServiceRequestStatus {
  Pending = 'pending',
  Scheduled = 'scheduled',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum ServiceRequestPriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
  Urgent = 'urgent',
}

export enum RecurrenceFrequency {
  OneTime = 'one_time',
  Daily = 'daily',
  Weekly = 'weekly',
  BiWeekly = 'bi_weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
}

@Table({
  tableName: 'service_request',
})
export class ServiceRequest extends BaseModel<ServiceRequest> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => Property)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  propertyId: number;

  @ForeignKey(() => Service)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  serviceId: number;

  @Column({
    type: DataType.ENUM(...Object.values(ServiceRequestStatus)),
    allowNull: false,
    defaultValue: ServiceRequestStatus.Pending,
  })
  status: ServiceRequestStatus;

  @Column({
    type: DataType.ENUM(...Object.values(ServiceRequestPriority)),
    allowNull: false,
    defaultValue: ServiceRequestPriority.Normal,
  })
  priority: ServiceRequestPriority;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  scheduledDate: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  scheduledTime: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  walkthroughDate: Date;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  walkthroughTime: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  completedDate: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  estimatedPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  actualPrice: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  specialInstructions: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  cancellationReason: string;

  @Column({
    type: DataType.ENUM(...Object.values(RecurrenceFrequency)),
    allowNull: false,
    defaultValue: RecurrenceFrequency.OneTime,
  })
  recurrenceFrequency: RecurrenceFrequency;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isRecurring: boolean;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  recurrenceEndDate: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  estimatedDurationMinutes: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  actualDurationMinutes: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  additionalServices: string[];

  @ApiHideProperty()
  @BelongsTo(() => User)
  user: User;

  @ApiHideProperty()
  @BelongsTo(() => Property)
  property: Property;

  @ApiHideProperty()
  @BelongsTo(() => Service)
  service: Service;

  @ApiHideProperty()
  @HasMany(() => ServiceRequestProduct, {
    hooks: true,
    onDelete: 'CASCADE',
  })
  serviceRequestProducts: ServiceRequestProduct[];

  @ApiHideProperty()
  @BelongsToMany(() => Product, {
    through: {
      model: () => ServiceRequestProduct,
      unique: false,
    },
    foreignKey: 'serviceRequestId',
    otherKey: 'productId',
  })
  products: Product[];
}
