import { BaseModel } from '@libraries/baseModel.entity';
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

export enum ServiceReportStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Reviewed = 'reviewed',
  Approved = 'approved',
}

@Table({
  tableName: 'service_report',
})
export class ServiceReport extends BaseModel<ServiceReport> {
  @ForeignKey(() => ServiceRequest)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true, // One report per service request
  })
  serviceRequestId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  staffId: number; // Usuario que realizó el servicio

  @Column({
    type: DataType.ENUM(...Object.values(ServiceReportStatus)),
    allowNull: false,
    defaultValue: ServiceReportStatus.Draft,
  })
  status: ServiceReportStatus;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
  })
  rating: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  comments: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  beforePhotos: string[]; // Array de URLs

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  afterPhotos: string[]; // Array de URLs

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  additionalPhotos: string[]; // Array de URLs

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  completedTasks: string[]; // Lista de tareas completadas

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  issuesFound: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
    notes?: string;
  }>;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  timeSpentMinutes: number;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  startTime: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  endTime: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  productsUsed: Array<{
    name: string;
    quantity: string;
    notes?: string;
  }>;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  equipmentUsed: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  customerFeedback: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
  })
  customerRating: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  customerWouldRecommend: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  staffNotes: string; // Notas privadas del personal

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  requiresFollowUp: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  followUpReason: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  submittedAt: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  reviewedAt: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  reviewedBy: number; // Admin que revisó el reporte

  @ApiHideProperty()
  @BelongsTo(() => ServiceRequest)
  serviceRequest: ServiceRequest;

  @ApiHideProperty()
  @BelongsTo(() => User, 'staffId')
  staff: User;

  @ApiHideProperty()
  @BelongsTo(() => User, 'reviewedBy')
  reviewer: User;
}
