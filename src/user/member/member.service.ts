import { Injectable } from '@nestjs/common';
/**
 * ModuleRef: a utility from NestJS core that allows dynamic resolution
 * of providers at runtime, instead of relying solely on constructor injection.
 * Useful when you need to resolve providers conditionally or lazily.
 */
import { ModuleRef } from '@nestjs/core';
import { Connection } from '../connection/connection';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MemberService {
  /**
   * ModuleRef is injected via constructor just like any other provider.
   * It gives access to the DI container so you can call .get(token)
   * to retrieve any registered provider by its token (class or string).
   */
  constructor(private moduleRef: ModuleRef) {}

  /**
   * Dynamically resolve the Connection provider at runtime using ModuleRef.
   * This achieves the same result as constructor injection,
   * but gives you more control over when and how the provider is resolved.
   */
  getConnectionName() {
    const connection = this.moduleRef.get(Connection);
    return connection.getName();
  }

  /**
   * Dynamically resolve the MailService provider at runtime.
   * Unlike constructor injection where the dependency is always available,
   * ModuleRef.get() retrieves it only when this method is called.
   */
  sendEmail() {
    const mailService = this.moduleRef.get(MailService);
    mailService.send();
  }
}
