import { DynamicModule, Module } from '@nestjs/common';
import { ValidationService } from './validation.service';

/**
 * ValidationModule uses the DynamicModule pattern via forRoot().
 * This is the same pattern used by ConfigModule.forRoot() and WinstonModule.forRoot().
 *
 * Why forRoot() instead of a regular @Module?
 * - global: true makes ValidationService available app-wide without each module
 *   needing to import ValidationModule explicitly.
 * - forRoot() is a convention: it signals that calling this method configures
 *   and returns a configured module instance. This is NestJS's standard way
 *   to create configurable, reusable modules.
 * - The empty @Module({}) decorator is required because forRoot() returns
 *   a DynamicModule that overrides it at runtime.
 */
@Module({})
export class ValidationModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ValidationModule,
      providers: [ValidationService],
      exports: [ValidationService],
    };
  }
}
