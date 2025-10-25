// create-service-request-demo-quote.dto.ts
import { CreatePropertyDto } from '@modules/property/dto/create-property.dto';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateServiceRequestDto } from './create-service-request.dto';

export class CreateServiceRequestDemoQuoteDto {
  // Service Request nested validation
  @ApiProperty({
    type: () => CreateServiceRequestDto,
    description: 'Service request information',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateServiceRequestDto)
  serviceRequest: CreateServiceRequestDto;

  // User nested validation
  @ApiProperty({
    type: () => CreateUserDto,
    description: 'User information',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  // Property nested validation
  @ApiProperty({
    type: () => CreatePropertyDto,
    description: 'Property information',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreatePropertyDto)
  property: CreatePropertyDto;
}
