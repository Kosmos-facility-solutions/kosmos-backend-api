import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PropertyType } from '../entities/property.entity';

export class CreatePropertyDto {
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(PropertyType)
  type: PropertyType;

  @IsNotEmpty()
  @MaxLength(500)
  @IsString()
  address: string;

  @IsOptional()
  @MaxLength(100)
  @IsString()
  city?: string;

  @IsOptional()
  @MaxLength(100)
  @IsString()
  state?: string;

  @IsOptional()
  @MaxLength(20)
  @IsString()
  zipCode?: string;

  @IsOptional()
  @MaxLength(100)
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  squareFeet?: number;

  @IsOptional()
  @MaxLength(50)
  @IsString()
  alarmCode?: string;

  @IsOptional()
  @IsString()
  accessInstructions?: string;

  @IsOptional()
  @MaxLength(255)
  @IsString()
  contactName?: string;

  @IsOptional()
  @MaxLength(20)
  @IsString()
  contactPhone?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsNumber()
  userId?: number;
}
