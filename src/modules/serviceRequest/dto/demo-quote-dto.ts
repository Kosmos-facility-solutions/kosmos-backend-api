import { CreatePropertyDto } from '@modules/property/dto/create-property.dto';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateServiceRequestDto } from './create-service-request.dto';

export class CreateServiceRequestDemoQuoteDto {
  // Nested Service validation
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateServiceRequestDto)
  serviceRequest: CreateServiceRequestDto;

  // Nested User validation
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  // Nested Property validation
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreatePropertyDto)
  property: CreatePropertyDto;
}
