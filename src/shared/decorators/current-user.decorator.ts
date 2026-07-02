import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../enums/Role';

export interface ActiveUserData {
  id: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (data: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: ActiveUserData }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
