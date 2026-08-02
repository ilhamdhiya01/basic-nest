import { Injectable } from '@nestjs/common';
import { ZodType } from 'zod';

/**
 * ValidationService is a shared utility provider (registered as global via
 * ValidationModule.forRoot()). It wraps Zod's schema.parse() so that any
 * service can validate data without importing Zod directly.
 *
 * The generic <T> ensures type safety: the return type matches the schema's
 * inferred type, so callers get the validated data back with correct types.
 */
@Injectable()
export class ValidationService {
  /**
   * validate() runs schema.parse(data) which throws ZodError on failure.
   * The thrown ZodError is caught by ValidationFilter (ExceptionFilter)
   * and converted into a 400 response with structured error details.
   */
  validate<T>(schema: ZodType<T>, data: T): T {
    return schema.parse(data);
  }
}
