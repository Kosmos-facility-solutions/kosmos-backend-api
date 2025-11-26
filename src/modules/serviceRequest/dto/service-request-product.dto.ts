import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class ServiceRequestProductDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}
