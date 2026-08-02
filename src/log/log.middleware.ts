import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * LogMiddleware implements NestMiddleware to intercept every request
 * matching the route pattern configured in AppModule.configure().
 *
 * Middleware runs before any route handler, making it ideal for
 * cross-cutting concerns like logging, auth checks, or rate limiting.
 * Unlike guards or interceptors, middleware has direct access to
 * the Express Request/Response objects.
 *
 * @Inject(WINSTON_MODULE_PROVIDER) is needed because Winston's logger
 * uses a string token, not a class — NestJS can't auto-inject by type.
 */
@Injectable()
export class LogMiddleware implements NestMiddleware<Request, Response> {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}

  /**
   * use() is called for every matching request.
   * Logs the incoming URL, then calls next() to pass control
   * to the next middleware or the route handler.
   * Without next(), the request would hang indefinitely.
   */
  use(req: Request, res: Response, next: () => void) {
    this.logger.info(`Recive request form URL: ${req.url}`);
    next();
  }
}
