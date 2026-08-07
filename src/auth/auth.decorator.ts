import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @Auth() is a custom parameter decorator that injects the authenticated user
 * directly into a route handler parameter.
 *
 * It's syntactic sugar over the manual approach:
 *
 *   current(@Req() request: Request) {
 *     const user = request.user;   // untyped, repeated in every handler
 *   }
 *
 * becomes:
 *
 *   current(@Auth() user: User) { ... }
 *
 * createParamDecorator() receives a factory function that NestJS calls
 * whenever a decorated parameter needs a value.
 *
 * @param _data Anything passed inside the decorator call — e.g. @Auth('role').
 *              Unused here, so it's prefixed with `_` to satisfy the linter.
 * @param ctx   ExecutionContext — a transport-agnostic wrapper around the
 *              current request. switchToHttp() narrows it to the HTTP layer;
 *              the same context could expose WebSocket or gRPC data instead.
 *
 * PRECONDITION: `request.user` is only populated by AuthMiddleware. If this
 * decorator is used on a route that AuthMiddleware is NOT registered for,
 * it silently returns undefined rather than throwing.
 */
export const Auth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
