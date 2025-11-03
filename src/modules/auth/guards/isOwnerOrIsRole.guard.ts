import { Logger } from '@core/logger/Logger';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IsOwnerGuard } from './isOwner.guard';
import { IsRoleGuard } from './isRole.guard';

@Injectable()
export class IsOwnerOrIsRoleGuard implements CanActivate {
  private logger: Logger = new Logger(IsOwnerOrIsRoleGuard.name);

  constructor(
    private isRole: IsRoleGuard,
    private isOwner: IsOwnerGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const hasRole = await this.isRole.canActivate(context);
      if (hasRole) return true;

      const isOwner = await this.isOwner.canActivate(context);
      return isOwner;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
