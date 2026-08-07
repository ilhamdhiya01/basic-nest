/**
 * The eslint disable below is needed because getRequest() returns `any`,
 * so reading `.user` off it is an unsafe assignment as far as the linter knows.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Roles } from './role.decorator';

/**
 * RoleGuard performs authorization: it decides WHETHER the already-identified
 * caller may run this handler. Identification itself is AuthMiddleware's job.
 *
 * Registered globally in AppModule via the APP_GUARD token:
 *
 *   providers: [{ provide: APP_GUARD, useClass: RoleGuard }]
 *
 * Using APP_GUARD instead of @UseGuards(RoleGuard) on each controller means
 * the guard runs on every route, and — because it's declared as a provider —
 * it can still inject dependencies like Reflector. Routes without @Roles()
 * are unaffected, since canActivate() lets them through (see below).
 */
@Injectable()
export class RoleGuard implements CanActivate {
  /**
   * Reflector is NestJS's metadata reader. It's what pulls back the value
   * that the @Roles() decorator attached to a handler.
   */
  constructor(private reflector: Reflector) {}

  /**
   * canActivate() decides whether the request proceeds.
   * Returning false makes NestJS respond 403 Forbidden automatically.
   *
   * The return type allows sync, Promise, or Observable — this implementation
   * is synchronous because the role is already on the request object, so no
   * extra database round trip is needed.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    /**
     * Read the @Roles([...]) metadata off the handler being invoked.
     * `Roles` is passed as the key itself, not a string — that's the
     * type-safe Reflector.createDecorator() API.
     *
     * NOTE: this only inspects getHandler() (the method). To also support
     * @Roles() applied at the controller level, this would need
     * getAllAndOverride(Roles, [context.getHandler(), context.getClass()]).
     */
    const roles = this.reflector.get(Roles, context.getHandler());

    /**
     * No @Roles() on this handler means the route is unrestricted.
     * This early return is what keeps a globally-registered guard from
     * locking down every route in the application.
     */
    if (!roles) {
      return true;
    }

    /**
     * `user` was attached to the request by AuthMiddleware.
     *
     * CAUTION: if a handler is decorated with @Roles() but its route is NOT
     * registered with AuthMiddleware in AppModule, `user` is undefined and
     * reading `.role` throws a TypeError — surfacing as a 500 instead of a 401.
     * Keep the two registrations in sync.
     */
    const user = context.switchToHttp().getRequest().user;

    /**
     * Allow the request only if the user's role appears in the allowed list.
     * indexOf() !== -1 is the pre-ES2016 form of includes(); both work here.
     */
    return roles.indexOf(user.role) !== -1;
  }
}
