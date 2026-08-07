/*
 * Prisma v7 uses a driver adapter pattern instead of bundling a built-in engine.
 * PrismaPg is the PostgreSQL adapter — it handles the actual database connection.
 * The eslint disables below are needed because Prisma v7's generated types
 * don't fully expose internal method signatures, causing unsafe-call warnings.
 */

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

/**
 * PrismaService wraps PrismaClient as a NestJS injectable.
 * By extending PrismaClient, this service inherits all Prisma query methods
 * (user.create, user.findMany, etc.) and can be injected anywhere via DI.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: configService.get<string>('DATABASE_URL'),
      }),
    });
    console.log('PrismaService constructor');
  }

  /**
   * onModuleInit runs once, after the module's dependencies are resolved but
   * before the app starts accepting requests.
   *
   * $connect() opens the database connection pool eagerly. Prisma would connect
   * lazily on the first query anyway, but doing it here means connection
   * problems surface at startup instead of on a user's first request.
   */
  async onModuleInit() {
    console.log('PrismaService onModuleInit');
    await this.$connect();
  }

  /**
   * onModuleDestroy runs during shutdown, releasing the connection pool so the
   * database doesn't hold orphaned connections.
   *
   * This only fires if app.enableShutdownHooks() was called in main.ts —
   * without it, NestJS ignores SIGTERM/SIGINT and the hook never runs.
   */
  async onModuleDestroy() {
    console.log('PrismaService onModuleDestroy');
    await this.$disconnect();
  }
}
