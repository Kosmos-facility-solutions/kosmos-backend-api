import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Floor Cleaning Kit' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false, example: 'Includes eco-friendly solutions.' })
  @IsString()
  @IsOptional()
  description?: string;
}
