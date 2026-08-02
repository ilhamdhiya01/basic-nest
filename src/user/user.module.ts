import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
/**
 * createConnection: factory function that uses ConfigService to decide
 * which Connection subclass to instantiate (MySQL or MongoDB).
 * Replaces the previous useClass approach that read process.env directly.
 */
import { Connection, createConnection } from './connection/connection';
import { mailService, MailService } from './mail/mail.service';
// import {
//   createUserRepository,
//   UserRepository,
// } from './user-repository/user-repository';
/**
 * MemberService: demonstrates dynamic provider resolution via ModuleRef
 * (see src/user/member/member.service.ts for implementation)
 */
import { MemberService } from './member/member.service';
/**
 * ConfigService: injected into the createConnection factory function.
 * Available here because ConfigModule.forRoot({ isGlobal: true })
 * is registered in AppModule.
 */
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './user-repository/user-repository';

@Module({
  /**
   * imports is empty because PrismaModule is @Global() —
   * PrismaService is available everywhere without importing PrismaModule.
   * Previously PrismaModule was imported here, but that's redundant
   * when the module is already marked as global.
   */
  imports: [],
  /**
   * Register which controllers belong to this module
   */
  controllers: [UserController],
  providers: [
    /**
     * Standard provider: NestJS will create an instance of UserService
     * that can be injected via constructor
     */
    UserService,
    UserRepository,
    MemberService,
    /**
     * useFactory: replaced the previous useClass approach.
     * Previously used useClass with a ternary reading process.env directly.
     * Now uses a factory function (createConnection) that receives
     * ConfigService as an injected dependency, making it testable
     * and consistent with NestJS config best practices.
     * inject: [ConfigService] tells NestJS to resolve ConfigService
     * and pass it as the first argument to createConnection.
     */
    {
      provide: Connection,
      useFactory: createConnection,
      inject: [ConfigService],
    },
    /**
     * useValue: provide an already-created instance instead of letting
     * NestJS instantiate it. Useful when the object is pre-configured
     * or comes from a third-party library
     */
    {
      provide: MailService,
      useValue: mailService,
    },
    /**
     * useFactory: create the provider using a factory function.
     * Useful when the provider needs complex setup logic or
     * depends on other providers at creation time.
     * inject: list of providers that the factory function needs
     * as parameters — NestJS will resolve them before calling the factory
     */
    // {
    //   provide: UserRepository,
    //   useFactory: createUserRepository,
    //   inject: [Connection],
    // },
    /**
     * useExisting: create an alias for an existing provider.
     * "EmailService" points to the same instance as MailService,
     * so injecting 'EmailService' returns the same MailService instance.
     * Useful for migration or when you want multiple injection tokens
     * to resolve to the same object
     */
    {
      provide: 'EmailService',
      useExisting: MailService,
    },
  ],
  /**
   * exports: makes UserService available to other modules that import UserModule.
   * Without this, UserService would only be usable inside UserModule.
   * AppController (in AppModule) injects UserService, which works because
   * UserModule is imported in AppModule AND UserService is exported here.
   */
  exports: [UserService],
})
export class UserModule {}
