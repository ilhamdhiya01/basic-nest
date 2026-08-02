/*
 * eslint-disable: ZodType.parse() returns `any` when the schema type is generic,
 * so the return type can't be narrowed safely. This is acceptable here because
 * the schema is provided by the caller who knows the expected shape.
 */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

/**
 * ValidationPipe is a custom pipe that validates request data against
 * a Zod schema. Unlike NestJS's built-in ValidationPipe (which uses class-validator),
 * this one uses Zod — giving you schema-first validation without decorators.
 *
 * The pipe is instantiated with `new ValidationPipe(schema)` in @UsePipes(),
 * which means each route can use a different schema for its body validation.
 *
 * metadata.type checks if the incoming data is from the request body.
 * Only body data is validated here — query params and route params
 * pass through unchanged. This prevents accidental validation of
 * non-body inputs that have their own validation mechanisms.
 */
@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private zodType: ZodType) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type == 'body') {
      return this.zodType.parse(value);
    }
    return value;
  }
}
