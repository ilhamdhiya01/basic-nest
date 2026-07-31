import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  /**
   * beforeEach runs before each test case
   * Creates a NestJS testing module with UserService as a provider
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    /**
     * Retrieve the UserService instance from the testing module
     */
    service = module.get<UserService>(UserService);
  });

  /**
   * Unit test: directly calls the service method (no HTTP involved)
   * async because sayHello() returns a Promise
   */
  it('should be able to say hello', async () => {
    const response = await service.sayHello('Ilham');
    expect(response).toBe('Hello Ilham');
  });
});
