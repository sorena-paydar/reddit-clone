import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { checkUsername } from '../common/utils/checkUsername';
import { User } from '@prisma/client';

@Injectable()
export class ParamValidationInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    // Get request from Context
    const req = ctx.switchToHttp().getRequest() as Request & {
      params: { username: string };
      user: User;
    };

    // Check username in request param
    checkUsername(req.params.username, req.user);

    return next.handle();
  }
}
