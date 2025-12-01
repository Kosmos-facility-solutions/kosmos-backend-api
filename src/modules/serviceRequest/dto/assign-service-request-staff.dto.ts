import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class AssignServiceRequestStaffDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  staffIds: number[];
}
