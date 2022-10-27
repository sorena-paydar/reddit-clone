import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const getUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
