import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
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
  constructor(private prismaService: PrismaService) {
    console.log('Create user repository');
  }

  /**
   * Holds a reference to the Connection provider
   * This is set manually by the factory function below
   */
  // connection: Connection;

  async save(name: string): Promise<User> {
    return this.prismaService.user.create({
      data: {
        // id: parseInt(id),
        firstName: name,
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
