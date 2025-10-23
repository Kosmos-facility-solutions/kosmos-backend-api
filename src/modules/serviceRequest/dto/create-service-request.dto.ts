import { ApiHideProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  RecurrenceFrequency,
  ServiceRequestPriority,
  ServiceRequestStatus,
} from '../entities/serviceRequest.entity';

export class CreateServiceRequestDto {
  @ApiHideProperty()
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsNotEmpty()
  @IsNumber()
  propertyId: number;

  @IsNotEmpty()
  @IsNumber()
  serviceId: number;

  @IsOptional()
  @IsEnum(ServiceRequestStatus)
  status?: ServiceRequestStatus;

  @IsOptional()
  @IsEnum(ServiceRequestPriority)
  priority?: ServiceRequestPriority;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  scheduledDate: Date;

  @IsNotEmpty()
  @IsString()
  scheduledTime: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  estimatedPrice: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  recurrenceFrequency?: RecurrenceFrequency;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : null), {
    toClassOnly: true,
  })
  recurrenceEndDate?: Date;

  @IsOptional()
  @IsNumber()
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalServices?: string[];
}
