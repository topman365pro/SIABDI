import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { CurrentUserPayload } from "../types/current-user.type";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }
);
