import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

/**
 * @Global() makes this module's exports available to every other module
 * without needing to explicitly import PrismaModule in each one.
 * This is the recommended pattern for shared infrastructure services
 * like database connections — you only need one instance app-wide.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
