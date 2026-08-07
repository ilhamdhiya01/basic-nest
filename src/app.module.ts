import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
/**
 * ConfigModule loads .env file into process.env automatically.
 * isGlobal: true makes ConfigService available across all modules
 * without needing to re-import ConfigModule in each module.
 */
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { WinstonModule } from 'nest-winston';
import { ValidationModule } from './validation/validation.module';
import * as winston from 'winston';
import { LogMiddleware } from './log/log.middleware';
import { AuthMiddleware } from './auth/auth.middleware';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './role/role.guard';

@Module({
  imports: [
    /**
     * WinstonModule is registered first so that the logger is available
     * before any other module initializes. This way, providers that inject
     * WINSTON_MODULE_PROVIDER (like UserRepository) can log during construction.
     * format: json outputs structured logs — easier to parse in production.
     * level: 'debug' captures everything during development.
     * transports: Console writes to stdout, which is standard for containerized apps.
     */
    WinstonModule.forRoot({
      format: winston.format.json(),
      level: 'debug',
      transports: [new winston.transports.Console()],
    }),
    /**
     * ConfigModule loads .env into process.env.
     * isGlobal: true makes ConfigService injectable everywhere without re-importing.
     */
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    /**
     * PrismaModule is @Global(), so it doesn't need to be imported in UserModule.
     * PrismaService is available everywhere automatically.
     */
    PrismaModule,
    /**
     * ValidationModule.forRoot() registers ValidationService as a global
     * provider. Using forRoot() pattern (same as ConfigModule and WinstonModule)
     * so ValidationService is injectable everywhere without re-importing.
     */
    ValidationModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    /**
     * Registering RoleGuard under the APP_GUARD token makes it a GLOBAL guard —
     * it runs on every route in the application, no @UseGuards() needed anywhere.
     *
     * Why this form instead of app.useGlobalGuards(new RoleGuard()) in main.ts:
     * declaring it as a provider keeps it inside the DI container, so NestJS can
     * inject its Reflector dependency. A manually constructed guard cannot.
     *
     * Being global does NOT mean every route is locked down: RoleGuard returns
     * true for any handler that has no @Roles() metadata, so only decorated
     * routes are actually restricted.
     */
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
/**
 * AppModule implements NestModule to register middleware.
 * configure() is called by NestJS during bootstrap to set up middleware.
 *
 * consumer.apply(SomeMiddleware) registers the middleware.
 * .forRoutes() restricts which routes trigger it:
 * - path: '/api/*' matches all routes under /api/
 * - method: RequestMethod.ALL means it runs for GET, POST, PUT, etc.
 *
 * Middleware is the FIRST stage of the NestJS request lifecycle:
 *   Middleware -> Guard -> Interceptor -> Pipe -> Route Handler
 * Middleware registration order here determines their execution order,
 * so LogMiddleware runs before AuthMiddleware on protected routes.
 */
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    /**
     * LogMiddleware runs for every API request so that all traffic is logged
     * before it reaches a route handler — including requests that are later
     * rejected by AuthMiddleware or RoleGuard.
     */
    consumer.apply(LogMiddleware).forRoutes({
      path: '/api/*',
      method: RequestMethod.ALL,
    });

    /**
     * AuthMiddleware is applied route-by-route rather than to all of '/api/*',
     * because public endpoints (such as POST /api/user/login) must stay
     * reachable without credentials.
     *
     * Both routes below are decorated with @Roles(['admin']) in UserController.
     * These two registrations must stay in sync with those decorators: a
     * @Roles() route that AuthMiddleware does not cover would leave
     * `request.user` undefined and make RoleGuard throw a 500 instead of a 401.
     *
     * forRoutes() is variadic, so these two calls could be collapsed into one:
     *   consumer.apply(AuthMiddleware).forRoutes(
     *     { path: '/api/user/current', method: RequestMethod.GET },
     *     { path: '/api/user/save', method: RequestMethod.GET },
     *   );
     */
    consumer.apply(AuthMiddleware).forRoutes({
      path: '/api/user/current',
      method: RequestMethod.GET,
    });
    consumer.apply(AuthMiddleware).forRoutes({
      path: '/api/user/save',
      method: RequestMethod.GET,
    });
  }
}
