import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
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
  scheduledDate: string; // ✅ Cambiado a string

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

// Nested DTO for User
class CreateUserNestedDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

// Nested DTO for Property
class CreatePropertyNestedDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsNumber()
  squareFeet?: number;

  @IsOptional()
  @IsString()
  accessInstructions?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsNumber()
  userId?: number;
}

export class CreateServiceRequestDemoQuoteDto {
  @ApiHideProperty()
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiHideProperty()
  @IsOptional()
  @IsNumber()
  propertyId?: number;

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
  recurrenceEndDate?: string | null;

  @IsOptional()
  @IsNumber()
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalServices?: string[];

  // Nested User validation
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUserNestedDto)
  user: CreateUserNestedDto;

  // Nested Property validation
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreatePropertyNestedDto)
  property: CreatePropertyNestedDto;
}
