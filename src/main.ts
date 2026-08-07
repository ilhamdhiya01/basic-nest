import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import mustache from 'mustache-express';
/**
 * ConfigService: used to read env vars via app.get(ConfigService)
 * instead of process.env directly. This is the NestJS-recommended way
 * to access configuration after ConfigModule is initialized.
 */
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

async function bootstrap() {
  /**
   * NestExpressApplication gives access to Express-specific methods
   * like app.set() for view engine config and app.engine() for custom engines.
   */
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /**
   * Replace NestJS's default logger with Winston.
   * app.get(WINSTON_MODULE_NEST_PROVIDER) retrieves the Winston logger
   * instance from the DI container — the same one injected via
   * WINSTON_MODULE_PROVIDER in other providers.
   * app.useLogger() makes all NestJS internal logs (startup, routes, errors)
   * go through Winston instead of the built-in console logger.
   */
  const logger: Logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  /**
   * cookie-parser middleware parses Cookie header from incoming requests
   * and populates req.cookies with key-value pairs.
   * The argument is the signing secret — signed cookies are tamper-proof
   * and accessible via req.signedCookies instead of req.cookies.
   */
  app.use(cookieParser('MY_SECET_KEY'));

  /**
   * View engine setup using Mustache templates.
   * __dirname points to dist/ (or src/ in dev), so '/../views' resolves
   * to the project root's /views folder where .html template files live.
   */
  app.set('views', __dirname + '/../views');
  app.set('view engine', 'html');
  app.engine('html', mustache());

  /**
   * enableShutdownHooks() makes NestJS listen for process termination signals
   * (SIGTERM, SIGINT, etc.) and run lifecycle hooks before exiting.
   *
   * Without this call, onModuleDestroy() is never invoked on shutdown — which
   * would leave PrismaService.$disconnect() unexecuted and the database
   * connection pool dangling. Matters especially in containers, where an
   * orchestrator stops the app by sending SIGTERM.
   */
  app.enableShutdownHooks();

  /**
   * app.get(ConfigService) retrieves the ConfigService instance from
   * the NestJS DI container. This works because ConfigModule.forRoot()
   * is registered in AppModule with isGlobal: true.
   * configService.get('PORT') reads the PORT env var; falls back to 3000
   * if PORT is not defined in .env
   */
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
