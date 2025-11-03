import { Plain } from '@libraries/baseModel.entity';
import { Property } from '@modules/property/entities/property.entity';
import { Role } from '@modules/role/entities/role.entity';
import { ServiceRequest } from '@modules/serviceRequest/entities/serviceRequest.entity';
import { UserRole } from '@modules/userrole/entities/userrole.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass } from 'class-transformer';
import { AuthType, User } from '../entities/user.entity';

export class UserResponseDto implements Plain<User> {
  @Expose()
  id: number;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  email: string;
  @Expose()
  phone: string;
  @Expose()
  additionalPhone: string;
  @Expose()
  isActive: boolean;
  @Expose()
  isEmailConfirmed: boolean;
  @Exclude()
  @ApiHideProperty()
  password: string;
  @Expose()
  authType: AuthType;
  @Exclude()
  @ApiHideProperty()
  userRoles: UserRole[];
  @Expose()
  @ApiHideProperty()
  roles: Role[] = undefined;
  @Expose()
  @ApiHideProperty()
  properties: Property[] = undefined;
  @Expose()
  @ApiHideProperty()
  quotes: ServiceRequest[] = undefined;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;

  static fromPlain(user: Plain<User>): UserResponseDto;
  static fromPlain(user: Plain<User>[]): UserResponseDto[];
  static fromPlain(
    user: Plain<User> | Plain<User>[],
  ): UserResponseDto | UserResponseDto[] {
    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  static fromUser(user: User): UserResponseDto;
  static fromUser(user: User[]): UserResponseDto[];
  static fromUser(_user: User | User[]): UserResponseDto | UserResponseDto[] {
    let user: Plain<User> | Plain<User>[];
    if (Array.isArray(_user)) {
      user = _user.map((user) => {
        return user.toJSON();
      });
    } else {
      user = _user.toJSON();
    }

    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
