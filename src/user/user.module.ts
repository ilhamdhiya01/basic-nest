import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller.js';

@Module({
  controllers: [UserController],
})
export class UserModule {}
