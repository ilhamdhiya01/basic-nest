import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
/**
 * UserService is imported from UserModule — this works because
 * UserModule exports UserService in its exports array.
 * Without exports: [UserService] in UserModule, injecting UserService
 * here in AppController (which belongs to AppModule) would fail.
 */
import { UserService } from './user/user/user.service';

@Controller()
export class AppController {
  /**
   * Cross-module injection: UserService is provided by UserModule
   * and made available to AppModule via the exports array.
   * This demonstrates how NestJS modules share providers.
   */
  constructor(
    private readonly appService: AppService,
    private userService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
