import { Plain } from '@libraries/baseModel.entity';
import { IFindOne } from '@libraries/intefaces/IFindOne';
import { SetMetadata, Type, UseGuards, applyDecorators } from '@nestjs/common';
import { Model } from 'sequelize-typescript';
import { IsOwnerOrIsRoleGuard } from '../guards/isOwnerOrIsRole.guard';

export function IsOwnerOrIsRole<T extends Model<T>>(
  serviceToken: Type<IFindOne>,
  roles: string[],
  key: keyof Plain<T> | 'userId' = 'userId',
) {
  return applyDecorators(
    SetMetadata('serviceToken', serviceToken),
    SetMetadata('roles', roles),
    SetMetadata('key', key),
    UseGuards(IsOwnerOrIsRoleGuard),
  );
}
