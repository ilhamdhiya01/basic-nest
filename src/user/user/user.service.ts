import { Injectable } from '@nestjs/common';

/**
 * @Injectable() marks this class as a provider that NestJS can inject.
 * It must be registered in the module's providers array to be available.
 */
@Injectable()
export class UserService {
  /**
   * Async method returning a Promise<string>
   * Promise.resolve() wraps a value in an immediately-resolved Promise
   * (simulating async work like a database query)
   */
  async sayHello(name: string): Promise<string> {
    return await Promise.resolve(`Hello ${name}`);
  }
}
