// Copyright 2024-2024 the API framework authors. All rights reserved. MIT license.
import { assertExists } from "@std/assert";
import type { ServerContext } from "./context.ts";
import { assertFunction, type ClassType, type MaybePromise } from "./utils.ts";

// TODO: doc strings
// TODO: doc strings with example usages

const registerFnName = "register";

/**
 * Get a class registration from a class type
 * An assertion error will be thrown if the class
 * has not been correctly registered.
 *
 * @param ctx - Server Context
 * @param target - The class to register
 * @returns Registration definition
 */
export function getClassRegistration(
  ctx: ServerContext,
  target: ClassType,
): InjectableRegistration | Promise<InjectableRegistration> {
  const descriptor = Object.getOwnPropertyDescriptor(
    target.prototype,
    registerFnName,
  );
  assertFunction(
    descriptor?.value,
    `No registration function ${registerFnName}() defined for injectable: ${target}`,
  );
  return descriptor.value(ctx);
}

const classRegistrations = new Map<symbol, ClassType>();

/**
 * Clear class registration. This is predominantly used for testing purposes.
 * @param target - The class to clear
 */
export function clearRegistration<T>(
  target: ClassType<T>,
): void {
  const key = getClassKey(target);
  classRegistrations.delete(key);
}

/**
 * Get all of the class registrations.
 * @returns - The class registrations as an iterators
 */
export function getClassRegistrations(): IterableIterator<[symbol, ClassType]> {
  return classRegistrations.entries();
}

const typeKey = Symbol("class.type.key");
export function registerClass<Class extends ClassType>(
  target: Class,
): symbol {
  const key = Symbol(target.name);
  Object.assign(target, { [typeKey]: key });
  classRegistrations.set(key, target);
  return key;
}
export function getClassKey(target: unknown): symbol {
  const key = maybeGetClassKey(target);
  assertExists(
    key,
    `Cannot get class key: ${
      (target as ClassType).name
    } has not been registered`,
  );
  return key;
}

export function maybeGetClassKey(target: unknown): symbol | undefined {
  return (target as Record<symbol, symbol | undefined>)[typeKey];
}

export interface Registration {
  class?: ClassType<Injectable>;
}

// TODO: move to container as it's DI
export interface InjectableRegistration {
  ctor: Registration[];
}

// TODO: move to container as it's DI
export interface Injectable {
  // TODO: maybe name to init?
  register(ctx: ServerContext): MaybePromise<InjectableRegistration>;
}
