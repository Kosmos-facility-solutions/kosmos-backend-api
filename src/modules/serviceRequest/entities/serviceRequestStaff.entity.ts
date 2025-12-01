import { BaseModel } from '@libraries/baseModel.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { ServiceRequest } from './serviceRequest.entity';

@Table({
  tableName: 'service_request_staff',
})
export class ServiceRequestStaff extends BaseModel<ServiceRequestStaff> {
  @ForeignKey(() => ServiceRequest)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  serviceRequestId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  staffId: number;

  @BelongsTo(() => ServiceRequest)
  serviceRequest: ServiceRequest;

  @BelongsTo(() => User)
  staff: User;
}
