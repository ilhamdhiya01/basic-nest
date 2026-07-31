/**
 * MailService is a plain class without @Injectable() because
 * it's not registered as a standard provider in the module.
 * Instead, it's registered via useValue with a pre-created instance.
 */
export class MailService {
  send() {
    console.log('Send email successfully');
  }
}

/**
 * Pre-created instance used as the provider value in UserModule
 * (see user.module.ts → provide: MailService, useValue: mailService)
 */
export const mailService = new MailService();
