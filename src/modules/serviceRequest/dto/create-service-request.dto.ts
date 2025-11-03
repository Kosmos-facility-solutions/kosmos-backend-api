import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
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
  @IsString()
  walkthroughDate: string;

  @IsNotEmpty()
  @IsString()
  walkthroughTime: string;

  @IsNotEmpty()
  @IsString()
  scheduledDate: string;

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
  @IsString()
  recurrenceEndDate?: string | null; // ✅ Cambiado a string

  @IsOptional()
  @IsNumber()
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalServices?: string[];
}
