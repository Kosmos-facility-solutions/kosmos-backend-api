import { BaseModel } from '@libraries/baseModel.entity';
import { Property } from '@modules/property/entities/property.entity';
import {
  RecurrenceFrequency,
  ServiceRequest,
} from '@modules/serviceRequest/entities/serviceRequest.entity';
import { User } from '@modules/user/entities/user.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';

export enum ContractStatus {
  Draft = 'draft',
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum PaymentFrequency {
  Weekly = 'weekly',
  BiWeekly = 'bi_weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  OneTime = 'one_time',
}

@Table({
  tableName: 'contract',
})
export class Contract extends BaseModel<Contract> {
  // ==================== RELACIONES ====================
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  clientId: number;

  @ForeignKey(() => ServiceRequest)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  serviceRequestId: number; // La cotización que generó este contrato

  @ForeignKey(() => Property)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  propertyId: number;

  // ==================== INFORMACIÓN BÁSICA ====================
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  contractNumber: string; // Ej: "CONT-2025-001"

  @Column({
    type: DataType.ENUM(...Object.values(ContractStatus)),
    allowNull: false,
    defaultValue: ContractStatus.Draft,
  })
  status: ContractStatus;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  startDate: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  endDate: Date;

  // ==================== INFORMACIÓN DE PAGOS ====================
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  paymentAmount: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentFrequency)),
    allowNull: false,
  })
  paymentFrequency: PaymentFrequency;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  nextPaymentDue: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  lastPaymentDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentMethod: string; // 'cash', 'check', 'bank_transfer', 'credit_card'

  // ==================== CONFIGURACIÓN DE HORARIOS ====================
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  workDays: string[]; // ['monday', 'wednesday', 'friday']

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  workStartTime: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  workEndTime: string;

  @Column({
    type: DataType.ENUM(...Object.values(RecurrenceFrequency)),
    allowNull: false,
    defaultValue: RecurrenceFrequency.Weekly,
  })
  serviceFrequency: RecurrenceFrequency;

  // ==================== TÉRMINOS Y NOTAS ====================
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  terms: string; // Términos y condiciones específicos del contrato

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  scope: string; // Descripción del alcance del trabajo (scope of work)

  // ==================== INFORMACIÓN ADICIONAL ====================
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  totalContractValue: number; // Valor total del contrato

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  estimatedDurationMinutes: number; // Duración estimada por servicio

  // ==================== ASOCIACIONES ====================
  @ApiHideProperty()
  @BelongsTo(() => User)
  client: User;

  @ApiHideProperty()
  @BelongsTo(() => Property)
  property: Property;

  @ApiHideProperty()
  @BelongsTo(() => ServiceRequest)
  serviceRequest: ServiceRequest;

  // Nota: Las relaciones con Payment, ContractTask y ContractStaff se agregarán
  // cuando creemos esos módulos
}
