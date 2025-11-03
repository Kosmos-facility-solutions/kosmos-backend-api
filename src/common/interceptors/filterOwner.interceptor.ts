import { ROLES } from '@modules/role/enums/roles.enum';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ParseWherePipe } from '@pipes/parseWhere.pipe';
import { Request } from 'express';
import _ from 'lodash';
import { Observable } from 'rxjs';

export interface Response<T> {
  data: T;
}

@Injectable()
export class FilterOwnerInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const req = context.switchToHttp().getRequest<Request>();

    // Verificar si el usuario es admin
    const userRoles = req.session.jwt.roles.map((role) => role.name);
    const isAdmin = userRoles.includes(ROLES.ADMIN);

    // Si es admin, NO filtrar - retornar todos los registros
    if (isAdmin) {
      return next.handle();
    }

    // Si NO es admin, filtrar por userId
    const key = this.reflector.get('key', context.getHandler());
    const whereElement = { [key]: req.session.jwt.id };
    req.session.where = Array.isArray(req.session.where)
      ? [...req.session.where, whereElement]
      : [whereElement];

    let reqWhere = req.query.where;
    if (_.isString(reqWhere)) {
      reqWhere = ParseWherePipe.parseWhereString(reqWhere);
      req.query.where = reqWhere;
    }

    if (Array.isArray(reqWhere)) {
      req.query.where = [...req.session.where, ...req.query.where];
    }
    if (_.isNil(req.query.where)) req.query.where = [...req.session.where];

    return next.handle();
  }
}
