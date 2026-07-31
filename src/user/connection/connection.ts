import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class Connection {
  getName(): string | null {
    return null;
  }
}

@Injectable()
export class MYSQLConnection extends Connection {
  getName(): string {
    return 'MySQL';
  }
}

@Injectable()
export class MongoDBConnection extends Connection {
  getName(): string {
    return 'MongoDB';
  }
}

/**
 * Factory function: called by NestJS to create a Connection instance.
 * Uses ConfigService (injected by NestJS) to read the DATABASE env var
 * instead of accessing process.env directly.
 * This is the recommended approach in NestJS — it centralizes config
 * access through ConfigService and makes the provider testable.
 *
 * Why useFactory instead of useClass?
 * - useClass with a ternary only chooses which class to instantiate,
 *   but doesn't allow injecting other providers (like ConfigService)
 *   into the decision logic.
 * - useFactory gives full control: you can read config, run conditional
 *   logic, and manually instantiate the desired class.
 */
export function createConnection(
  configurationService: ConfigService,
): Connection {
  /**
   * ConfigService.get() reads from .env (loaded by ConfigModule.forRoot)
   * Returns the value as a union type for type safety
   */
  const connectType = configurationService.get('DATABASE') as
    'mysql' | 'mongodb';
  if (connectType === 'mysql') {
    return new MYSQLConnection();
  }
  return new MongoDBConnection();
}
