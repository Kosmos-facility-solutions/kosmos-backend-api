import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  RecurrenceFrequency,
  ServiceRequestPriority,
  ServiceRequestStatus,
  ServiceRequestPaymentFrequency,
} from '../entities/serviceRequest.entity';
import { ServiceRequestProductDto } from './service-request-product.dto';

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedPrice?: number;

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
  @IsString()
  preferredWalkthroughContactTime?: string;

  @IsOptional()
  @IsString()
  walkthroughNotes?: string;

  @IsOptional()
  @IsNumber()
  estimatedDurationMinutes?: number;

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
  @IsEnum(ServiceRequestPaymentFrequency)
  paymentFrequency?: ServiceRequestPaymentFrequency;
}
