import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PAYMENT_REMINDER_LEAD_DAYS } from '@modules/contract/constants/payment-reminder';
import {
  RecurrenceFrequency,
  ServiceRequestPriority,
  ServiceRequestStatus,
} from '../entities/serviceRequest.entity';
import { ServiceRequestProductDto } from './service-request-product.dto';

export class UpdateServiceRequestDto {
  @IsOptional()
  @IsNumber()
  propertyId?: number;

  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @IsOptional()
  @IsEnum(ServiceRequestStatus)
  status?: ServiceRequestStatus;

  @IsOptional()
  @IsEnum(ServiceRequestPriority)
  priority?: ServiceRequestPriority;

  @IsOptional()
  @IsString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsString()
  walkthroughDate?: string;

  @IsOptional()
  @IsString()
  walkthroughTime?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined), {
    toClassOnly: true,
  })
  completedDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualPrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  recurrenceFrequency?: RecurrenceFrequency;

  @IsOptional()
  @IsString()
  recurrenceEndDate?: Date;

  @IsOptional()
  @IsString()
  preferredWalkthroughContactTime?: string;

  @IsOptional()
  @IsString()
  walkthroughNotes?: string;

  @IsOptional()
  @IsNumber()
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsNumber()
  actualDurationMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalServices?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceRequestProductDto)
  products?: ServiceRequestProductDto[];

  @IsOptional()
  @IsIn(PAYMENT_REMINDER_LEAD_DAYS)
  paymentReminderLeadDays?: number;
}
