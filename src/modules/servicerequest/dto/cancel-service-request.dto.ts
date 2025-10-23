import { IsNotEmpty, IsString } from 'class-validator';

export class CancelServiceRequestDto {
  @IsNotEmpty()
  @IsString()
  cancellationReason: string;
}
