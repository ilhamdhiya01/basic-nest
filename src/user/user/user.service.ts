import { Injectable } from '@nestjs/common';
import { ValidationService } from 'src/validation/validation.service';
import z from 'zod';

/**
 * @Injectable() marks this class as a provider that NestJS can inject.
 * It must be registered in the module's providers array to be available.
 */
@Injectable()
export class UserService {
  /**
   * ValidationService is injected via constructor DI.
   * It's available globally because ValidationModule.forRoot()
   * is registered with global: true in AppModule.
   */
  constructor(private validationService: ValidationService) {}

  /**
   * sayHello validates the name parameter using a Zod schema
   * (min 3, max 100 characters) before using it.
   *
   * The schema is defined inline here, but for reusable schemas
   * it's better to define them in a separate model file (see login.model.ts).
   * validationService.validate() throws ZodError if validation fails,
   * which is caught by ValidationFilter on the controller.
   */
  sayHello(name: string): string {
    const schema = z.string().min(3).max(100);
    const result = this.validationService.validate(schema, name);

    return `Hello ${result}`;
  }
}
