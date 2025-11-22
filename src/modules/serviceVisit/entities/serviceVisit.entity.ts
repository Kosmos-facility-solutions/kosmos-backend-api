import { BaseModel } from '@libraries/baseModel.entity';
import { Contract } from '@modules/contract/entities/contract.entity';
import { ServiceRequest } from '@modules/serviceRequest/entities/serviceRequest.entity';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';

export enum ServiceVisitStatus {
  Pending = 'pending',
  Completed = 'completed',
  Skipped = 'skipped',
  Cancelled = 'cancelled',
}

@Table({
  tableName: 'service_visit',
})
export class ServiceVisit extends BaseModel<ServiceVisit> {
  @ForeignKey(() => Contract)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  contractId: number;

  @ForeignKey(() => ServiceRequest)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  serviceRequestId: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  scheduledDate: Date;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  scheduledTime: string;

  @Column({
    type: DataType.ENUM(...Object.values(ServiceVisitStatus)),
    allowNull: false,
    defaultValue: ServiceVisitStatus.Pending,
  })
  status: ServiceVisitStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @BelongsTo(() => Contract)
  contract: Contract;

  @BelongsTo(() => ServiceRequest)
  serviceRequest: ServiceRequest;
}
