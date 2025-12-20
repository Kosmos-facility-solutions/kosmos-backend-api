import { RecurrenceFrequency } from '@modules/serviceRequest/entities/serviceRequest.entity';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ContractStatus,
  PaymentFrequency,
} from '../entities/contract.entity';
import {
  PAYMENT_REMINDER_LEAD_DAYS,
  PaymentReminderLeadDays,
} from '../constants/payment-reminder';

export class CreateContractDto {
  // ==================== RELACIONES ====================
  @ApiHideProperty()
  @IsOptional()
  @IsNumber()
  clientId?: number;

  @ApiProperty({
    description:
      'ID of the service request (quote) that originated this contract',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  serviceRequestId?: number;

  @ApiProperty({
    description: 'Property ID where the service will be performed',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  propertyId: number;

  // ==================== INFORMACIÓN BÁSICA ====================
  @ApiProperty({
    description: 'Contract status',
    enum: ContractStatus,
    default: ContractStatus.Draft,
  })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({
    description: 'Contract start date',
    example: '2025-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Contract end date (optional for ongoing contracts)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // ==================== INFORMACIÓN DE PAGOS ====================
  @ApiProperty({
    description: 'Payment amount per period',
    example: 500.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  paymentAmount: number;

  @ApiProperty({
    description: 'Payment frequency',
    enum: PaymentFrequency,
    example: PaymentFrequency.Monthly,
  })
  @IsNotEmpty()
  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency;

  @ApiProperty({
    description: 'Next payment due date',
    example: '2025-02-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  nextPaymentDue?: string;

  @ApiProperty({
    description: 'Payment method',
    example: 'bank_transfer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiProperty({
    description: 'Days before due date to send payment reminder',
    enum: PAYMENT_REMINDER_LEAD_DAYS,
    required: false,
    example: 7,
  })
  @IsOptional()
  @IsIn(PAYMENT_REMINDER_LEAD_DAYS)
  paymentReminderLeadDays?: PaymentReminderLeadDays;

  // ==================== CONFIGURACIÓN DE HORARIOS ====================
  @ApiProperty({
    description: 'Days of the week when service is performed',
    example: ['monday', 'wednesday', 'friday'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workDays?: string[];

  @ApiProperty({
    description: 'Work start time',
    example: '08:00:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  workStartTime?: string;

  @ApiProperty({
    description: 'Work end time',
    example: '17:00:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  workEndTime?: string;

  @ApiProperty({
    description: 'Service frequency',
    enum: RecurrenceFrequency,
    default: RecurrenceFrequency.Weekly,
  })
  @IsNotEmpty()
  @IsEnum(RecurrenceFrequency)
  serviceFrequency: RecurrenceFrequency;

  // ==================== TÉRMINOS Y NOTAS ====================
  @ApiProperty({
    description: 'Contract terms and conditions',
    required: false,
  })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({
    description: 'Additional notes about the contract',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Scope of work description',
    required: false,
  })
  @IsOptional()
  @IsString()
  scope?: string;

  // ==================== INFORMACIÓN ADICIONAL ====================
  @ApiProperty({
    description: 'Total contract value',
    example: 6000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalContractValue?: number;

  @ApiProperty({
    description: 'Estimated duration in minutes per service',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationMinutes?: number;
}
