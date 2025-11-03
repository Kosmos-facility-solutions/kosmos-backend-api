import { Logger } from '@core/logger/Logger';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IsRoleGuard } from './isRole.guard';
import { IsSelfUserGuard } from './isSelfUser.guard';

import { firstValueFrom, isObservable } from 'rxjs';

@Injectable()
export class IsSelfUserOrIsRoleGuard implements CanActivate {
  private readonly logger = new Logger(IsSelfUserOrIsRoleGuard.name);

  constructor(
    private readonly isRole: IsRoleGuard,
    private readonly isSelfUser: IsSelfUserGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const roleResult = await this.isRole.canActivate(context);
      const selfResult = await this.isSelfUser.canActivate(context);

      const resolvedRole = await resolveGuardResult(roleResult);
      const resolvedSelf = await resolveGuardResult(selfResult);

      return resolvedRole || resolvedSelf;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}

// Helper para manejar cualquier tipo de retorno
async function resolveGuardResult(
  result: boolean | Promise<boolean> | Observable<boolean>,
): Promise<boolean> {
  if (isObservable(result)) {
    return await firstValueFrom(result);
  }
  return await Promise.resolve(result);
}
