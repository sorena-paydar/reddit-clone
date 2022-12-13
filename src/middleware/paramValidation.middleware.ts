import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { checkUserParam } from '../common/utils';
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
    if (req.user) checkUserParam(req.params, req.user);

    return next.handle();
  }
}
