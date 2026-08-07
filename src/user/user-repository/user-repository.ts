import { Inject, Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
import { Logger } from 'winston';
// import { Connection } from '../connection/connection';

/**
 * UserRepository is now an @Injectable() provider.
 * Previously it was a plain class created via useFactory, but now that
 * it uses constructor injection for PrismaService, it needs @Injectable()
 * so that NestJS can read its constructor parameter types via reflect-metadata
 * and automatically inject the correct dependencies.
 */
@Injectable()
export class UserRepository {
  constructor(
    private prismaService: PrismaService,
    /**
     * @Inject with WINSTON_MODULE_PROVIDER is needed because Winston's
     * logger is registered with a string token, not a class token.
     * NestJS can only auto-inject by class type — for string tokens,
     * you must explicitly tell it which token to resolve.
     * This gives you the same Winston instance configured in AppModule.
     */
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {
    logger.info('Create user repository');
  }

  /**
   * Holds a reference to the Connection provider
   * This is set manually by the factory function below
   */
  // connection: Connection;

  /**
   * Inserts a new user row via Prisma.
   *
   * @param firstName Required — enforced by the caller (UserController.save)
   * @param lastName  Optional in the schema (String?), so it may be undefined
   * @param role      Optional in the schema (String?). This is the value
   *                  RoleGuard later compares against a handler's @Roles([...])
   *                  list, so a user saved without a role can't pass any
   *                  role-restricted route.
   */
  async save(firstName: string, lastName: string, role: string): Promise<User> {
    this.logger.info('Saving user', { firstName, lastName, role });
    return this.prismaService.user.create({
      data: {
        // id: parseInt(id),
        firstName,
        lastName,
        role,
      },
    });
  }
}

/**
 * Factory function: called by NestJS to create a UserRepository instance.
 * The "connection" parameter is automatically injected by NestJS
 * because of the "inject: [Connection]" config in user.module.ts.
 * This pattern is useful when a class needs manual setup
 * that can't be done purely through constructor injection.
 */
// export function createUserRepository(connection: Connection): UserRepository {
//   const userRepository = new UserRepository();
//   userRepository.connection = connection;
//   return userRepository;
// }
