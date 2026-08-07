/**
 * The eslint disable below is needed because `req` is typed as `any`
 * (Express Request doesn't know about the custom `user` property we attach).
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma/prisma.service';

/**
 * AuthMiddleware performs authentication: it identifies WHO the caller is.
 * Authorization (what they're allowed to do) is handled separately by RoleGuard.
 *
 * Middleware runs BEFORE guards in the NestJS request lifecycle:
 *   Middleware -> Guard -> Interceptor -> Pipe -> Route Handler
 * That ordering is what makes this work — by the time RoleGuard reads
 * `request.user`, this middleware has already populated it.
 *
 * Registered in AppModule.configure() for specific routes only, so public
 * routes (like /api/user/login) stay reachable without credentials.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  /**
   * PrismaService is injectable here because PrismaModule is @Global().
   * Middleware declared as a class (not a function) supports full DI.
   */
  constructor(private prismaService: PrismaService) {}

  /**
   * use() is the middleware entry point, called by NestJS for every matching request.
   *
   * @param req  Express request — typed `any` so we can attach `req.user` to it
   * @param res  Express response — unused here, we never write to it directly
   * @param next Callback that passes control to the next handler in the chain.
   *             IMPORTANT: if next() is not called and no exception is thrown,
   *             the request hangs forever.
   */
  async use(req: any, res: any, next: () => void) {
    /**
     * Read the caller's identity from the `x-username` header.
     *
     * NOTE: despite the name, this holds a numeric user ID, not a username —
     * it's converted with Number() and used as the primary key below.
     *
     * Number() returns NaN for non-numeric input, and NaN is falsy, so the
     * guard below catches both a missing header and a malformed one.
     *
     * SECURITY: this is a simplified auth scheme for learning purposes.
     * A raw ID in a header is trivially spoofable — anyone can send
     * `x-username: 1` and impersonate that user. Production code should use
     * a signed token (JWT) or a server-side session instead.
     */
    const username = Number(req.headers['x-username']);
    if (!username) {
      throw new HttpException('Unauthorized', 401);
    }

    /**
     * Look the user up in the database. findUnique() returns null (not a throw)
     * when no row matches, so the null case is handled explicitly below.
     */
    const user = await this.prismaService.user.findUnique({
      where: {
        id: username,
      },
    });

    /**
     * Attach the resolved user to the request object so downstream consumers
     * can read it without hitting the database again:
     *  - RoleGuard reads `request.user.role` to authorize
     *  - The @Auth() param decorator reads `request.user` to inject it
     *
     * Throwing HttpException from middleware works because NestJS's exception
     * layer wraps middleware execution — it becomes a 401 JSON response.
     */
    if (user) {
      req.user = user;
      next();
    } else {
      throw new HttpException('Unauthorized', 401);
    }
  }
}
