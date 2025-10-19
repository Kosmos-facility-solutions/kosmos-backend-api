import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ServiceCategory } from '../entities/service.entity';

export class CreateServiceDto {
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @MaxLength(50)
  @IsString()
  priceUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];
}
