import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ScheduleWalkthroughDto {
  @IsNotEmpty()
  @IsString()
  walkthroughDate: string;

  @IsNotEmpty()
  @IsString()
  walkthroughTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
