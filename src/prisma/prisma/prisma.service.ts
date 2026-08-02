/*
 * Prisma v7 uses a driver adapter pattern instead of bundling a built-in engine.
 * PrismaPg is the PostgreSQL adapter — it handles the actual database connection.
 * The eslint disables below are needed because Prisma v7's generated types
 * don't fully expose internal method signatures, causing unsafe-call warnings.
 */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

/**
 * PrismaService wraps PrismaClient as a NestJS injectable.
 * By extending PrismaClient, this service inherits all Prisma query methods
 * (user.create, user.findMany, etc.) and can be injected anywhere via DI.
 */
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: configService.get<string>('DATABASE_URL'),
      }),
    });
    console.log('PrismaService constructor');
  }
}
