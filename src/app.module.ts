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
  providers: [AppService],
})
/**
 * AppModule implements NestModule to register middleware.
 * configure() is called by NestJS during bootstrap to set up middleware.
 *
 * consumer.apply(LogMiddleware) registers the middleware.
 * .forRoutes() restricts which routes trigger it:
 * - path: '/api/*' matches all routes under /api/
 * - method: RequestMethod.ALL means it runs for GET, POST, PUT, etc.
 *
 * This way every API request is logged before reaching the route handler.
 */
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: '/api/*',
      method: RequestMethod.ALL,
    });
  }
}
