import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class IssueFoundDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  severity: 'low' | 'medium' | 'high';

  @IsNotEmpty()
  @IsBoolean()
  resolved: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

class ProductUsedDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  quantity: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateServiceReportDto {
  @IsNotEmpty()
  @IsNumber()
  serviceRequestId: number;

  @ApiHideProperty()
  @IsOptional()
  @IsNumber()
  staffId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beforePhotos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  afterPhotos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalPhotos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedTasks?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IssueFoundDto)
  issuesFound?: IssueFoundDto[];

  @IsOptional()
  @IsNumber()
  timeSpentMinutes?: number;

  @IsOptional()
  @IsString()
  startTime?: string; // Format: "HH:MM:SS"

  @IsOptional()
  @IsString()
  endTime?: string; // Format: "HH:MM:SS"

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductUsedDto)
  productsUsed?: ProductUsedDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentUsed?: string[];

  @IsOptional()
  @IsString()
  staffNotes?: string;

  @IsOptional()
  @IsBoolean()
  requiresFollowUp?: boolean;

  @IsOptional()
  @IsString()
  followUpReason?: string;
}
