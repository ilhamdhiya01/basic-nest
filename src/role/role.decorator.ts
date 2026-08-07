import { Reflector } from '@nestjs/core';

/**
 * @Roles(['admin']) attaches metadata to a route handler declaring which
 * roles are allowed to call it. The decorator itself enforces nothing —
 * it only tags the handler. RoleGuard reads the tag and does the enforcing.
 *
 * Reflector.createDecorator<string[]>() is the modern, type-safe way to build
 * metadata decorators. The older approach was:
 *
 *   export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
 *   // read back with: reflector.get<string[]>('roles', context.getHandler())
 *
 * The string key 'roles' had to match on both sides, and the type argument
 * was a manual assertion. With createDecorator the decorator object IS the
 * key, so a typo becomes a compile error and the value type is inferred.
 *
 * The <string[]> type argument means the decorator takes an array, hence
 * @Roles(['admin']) with brackets — not @Roles('admin').
 *
 * Usage: see UserController.current() and UserController.save().
 */
export const Roles = Reflector.createDecorator<string[]>();
