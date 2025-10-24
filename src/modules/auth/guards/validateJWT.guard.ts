import { Logger } from '@core/logger/Logger';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ValidateJWTGuard implements CanActivate {
  private logger: Logger = new Logger(ValidateJWTGuard.name);

  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const token = this.getToken(request);
      const payload = this.jwtService.verify(token);
      request['session'] = { ...(request['session'] || {}), jwt: payload };
      request['user'] = payload;

      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  private getToken(request: Request): string {
    const authorization = request.get('Authorization');
    if (!authorization) {
      throw new BadRequestException('Authorization header is not present');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
      throw new BadRequestException('Invalid authorization format');
    }

    return parts[1];
  }
}
