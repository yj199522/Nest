import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string|undefined, ctx: ExecutionContext) => {
    console.log('data', data);
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (data) return request.user[data];
    return request.user;
  },
);