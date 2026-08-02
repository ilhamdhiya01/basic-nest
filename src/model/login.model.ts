import z from 'zod';

/**
 * LoginUserRequest is a plain TypeScript class used as a type reference
 * for NestJS @Body() extraction. It defines the expected shape of the
 * login request body so that controllers can use it as a type parameter.
 *
 * The actual validation is handled by the Zod schema below, not by this class.
 * This is a common pattern in NestJS: a class for type safety in DI/decorators,
 * paired with a Zod schema for runtime validation.
 */
export class LoginUserRequest {
  username: string;
  password: string;
}

/**
 * loginRequestUserValidation is the Zod schema that enforces:
 * - username: non-empty string, max 50 characters
 * - password: non-empty string, max 50 characters
 *
 * Used by ValidationPipe in the login route to validate the request body
 * before it reaches the controller method.
 */
export const loginRequestUserValidation = z.object({
  username: z.string().max(50).min(1),
  password: z.string().max(50).min(1),
});
