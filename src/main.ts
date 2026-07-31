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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser('MY_SECET_KEY'));
  app.set('views', __dirname + '/../views');
  app.set('view engine', 'html');
  app.engine('html', mustache());

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
