import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CustomerFeedbackDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  customerRating: number;

  @IsOptional()
  @IsString()
  customerFeedback?: string;

  @IsNotEmpty()
  @IsBoolean()
  customerWouldRecommend: boolean;
}
