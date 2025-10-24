import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ApproveServiceRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  confirmedPrice?: number;

  @IsOptional()
  @IsNumber()
  assignedStaffId?: number;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
