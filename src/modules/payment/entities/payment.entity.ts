import { BaseModel } from '@libraries/baseModel.entity';
import { Contract } from '@modules/contract/entities/contract.entity';
import { ServiceRequest } from '@modules/serviceRequest/entities/serviceRequest.entity';
import { User } from '@modules/user/entities/user.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';

export enum PaymentStatus {
  Pending = 'pending',
  RequiresAction = 'requires_action',
  Processing = 'processing',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Canceled = 'canceled',
  Refunded = 'refunded',
}

export enum PaymentProvider {
  Stripe = 'stripe',
  MercadoPago = 'mercado_pago',
  Manual = 'manual',
}

@Table({
  tableName: 'payment',
})
export class Payment extends BaseModel<Payment> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => ServiceRequest)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  serviceRequestId: number;

  @ForeignKey(() => Contract)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  contractId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'USD',
  })
  currency: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.Pending,
  })
  status: PaymentStatus;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: PaymentProvider.Stripe,
  })
  provider: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  channel: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  providerPaymentId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  providerCustomerId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  reference: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata: Record<string, unknown>;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  paymentUrl: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  receiptUrl: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  paidAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiresAt: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  failureReason: string;

  @ApiHideProperty()
  @BelongsTo(() => User)
  user: User;

  @ApiHideProperty()
  @BelongsTo(() => ServiceRequest)
  serviceRequest: ServiceRequest;

  @ApiHideProperty()
  @BelongsTo(() => Contract)
  contract: Contract;
}
