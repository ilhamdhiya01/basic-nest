import { Connection } from '../connection/connection';

/**
 * UserRepository is a plain class (no @Injectable()) because
 * it's created via a factory function, not by NestJS's DI container directly.
 */
export class UserRepository {
  /**
   * Holds a reference to the Connection provider
   * This is set manually by the factory function below
   */
  connection: Connection;

  save() {
    console.log(`Save user with connection ${this.connection.getName()}`);
  }
}

/**
 * Factory function: called by NestJS to create a UserRepository instance.
 * The "connection" parameter is automatically injected by NestJS
 * because of the "inject: [Connection]" config in user.module.ts.
 * This pattern is useful when a class needs manual setup
 * that can't be done purely through constructor injection.
 */
export function createUserRepository(connection: Connection): UserRepository {
  const userRepository = new UserRepository();
  userRepository.connection = connection;
  return userRepository;
}
