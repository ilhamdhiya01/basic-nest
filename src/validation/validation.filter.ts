import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

/**
 * ValidationFilter catches ZodError exceptions thrown by schema.parse()
 * and converts them into a structured 400 Bad Request response.
 *
 * @Catch(ZodError) makes this filter specific to ZodError only — other
 * exceptions will pass through to NestJS's default exception handler.
 * This is cleaner than a generic catch-all filter because it separates
 * validation errors from other error types.
 *
 * Used via @UseFilters(ValidationFilter) on controller methods where
 * Zod validation is applied (e.g., login, sayHello).
 */
@Catch(ZodError)
export class ValidationFilter implements ExceptionFilter<ZodError> {
  /**
   * ArgumentsHost gives access to the execution context (HTTP, RPC, WS).
   * switchToHttp() returns the HTTP context, from which we get the
   * Express Response object to send the error response.
   *
   * exception.issues contains Zod's detailed validation errors
   * (field name, expected type, error message for each failed rule).
   */
  catch(exception: ZodError, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    return response.status(400).json({
      code: 400,
      errors: exception.issues,
    });
  }
}
