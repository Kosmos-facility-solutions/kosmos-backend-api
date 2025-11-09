import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(255)
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @MaxLength(255)
  @IsPhoneNumber()
  additionalPhone: string;

  //@IsNotEmpty()
  @IsOptional() //Set as optional for the current user creation flow
  @MinLength(8)
  @IsString()
  password: string;

  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  @IsOptional()
  lastName: string;
}
