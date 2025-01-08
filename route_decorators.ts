// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import { toPascalCase } from "@std/text";
import type { Context } from "./context.ts";
import {
  getRegistrationKey,
  type Injectable,
  type InjectableDecorator,
} from "./registration.ts";
import type { Responses } from "./response.ts";
import {
  type HttpMethod,
  registerController,
  registerRoute,
  type RoutePath,
} from "./router.ts";
import type { ClassType, MaybePromise } from "./utils.ts";

// TODO: remove ignore
/**
 * Register a Controller with the provided options for the class.
 *
 * This will be available to use within the DI framework.
 *
 * Typically, a controller will govern the defined resource indicated by the path.
 *
 * @param path The base path of the controller. Note, this should not include the version,
 * this is separately registered for groups of controllers in `Application.registerVersion`.
 * @returns a decorator that will register the controller.
 * @example Usage
 * ```ts no-assert ignore
 * import { Controller, Get, Injectable, InjectableRegistration } from "@eyrie/app";
 * @Controller('/messages')
 * class MessageController implements Injectable {
 *   register(): InjectableRegistration {
 *     return { dependencies: [] };
 *   }
 *   @Get({ path: "/" })
 *   public getMessages(): string[] {
 *     return ["Hello", "Hiya"];
 *   }
 * }
 * ```
 */
export function Controller(path: RoutePath): InjectableDecorator {
  function controllerDecorator(
    target: ClassType<Injectable>,
    _context: ClassDecoratorContext,
  ): void {
    registerController(target, { path });
  }
  return controllerDecorator;
}

/**
 * A Decorator error that can be thrown when registering the application
 * with decorators.
 *
 * @example Usage
 * ```ts
 * import { RouteDecoratorError } from "@eyrie/app";
 * import { assert } from "@std/assert";
 *
 * const error = new RouteDecoratorError()
 * assert(error instanceof Error);
 * assert(typeof error.message === "string");
 * ```
 */
export class RouteDecoratorError extends Error {
  /**
   * The name of the error.
   * @example Usage
   * ```ts
   * import { RouteDecoratorError } from "@eyrie/app";
   * import { assert, assertEquals } from "@std/assert";
   *
   * const error = new RouteDecoratorError()
   * assertEquals(error.name, "RouteDecoratorError");
   * ```
   */
  override readonly name = "RouteDecoratorError";
}

/**
 * Build decorator for the specific route method. All values of {@linkcode HttpMethod}
 * are supported.
 * @param options The route method decorator options.
 * @returns The built decorator
 * @typeParam ResponseType The response type of the route.
 * @typeParam RequestBody The response body type of the route.
 * @example Usage
 * ```ts ignore
 * import { buildRouteDecorator, HttpMethod } from "@eyrie/app";
 * buildRouteDecorator({ method: HttpMethod.GET });
 * ```
 */
export function buildRouteDecorator<
  ResponseType extends ClassType,
  RequestBody extends ClassType,
>(
  options: BuildRouteDecoratorOptions<ResponseType, RequestBody>,
): (
  _target:
    | RouteDecoratorTarget<InstanceType<ResponseType>>
    | RouteDecoratorTargetWithBody<InstanceType<ResponseType>, RequestBody>,
  context: ClassMethodDecoratorContext,
) => void {
  return function route(
    _target:
      | RouteDecoratorTarget<InstanceType<ResponseType>>
      | RouteDecoratorTargetWithBody<InstanceType<ResponseType>, RequestBody>,
    context: ClassMethodDecoratorContext,
  ): void {
    const methodName = context.name;
    const key = Symbol(String(methodName));
    context.addInitializer(function (this: unknown) {
      const thisArg = this as ClassType;
      if (context.private || context.static) {
        throw new RouteDecoratorError(
          `${
            toPascalCase(options.method)
          }() registration failed for '${thisArg?.name}.${
            String(methodName)
          }': private and static field registration is unsupported`,
        );
      }
      const classKey = getRegistrationKey(thisArg.constructor);
      let body: symbol | undefined = undefined;
      if (options.body) {
        body = getRegistrationKey(options.body);
      }
      registerRoute(key, {
        method: options.method,
        path: options.path,
        controller: classKey,
        methodName: methodName,
        ...(body ? { body } : {}),
      });
    });
  };
}

/**
 * The options of the {@linkcode buildRouteDecorator} function.
 */
export interface BuildRouteDecoratorOptions<
  Responses extends ClassType,
  RequestBody extends ClassType,
> {
  /**
   * The description of the route.
   */
  description: string;
  /**
   * The method of the route.
   */
  method: HttpMethod;
  /**
   * The path to register the route for.
   * This will be prefixed by the controller path.
   */
  path: RoutePath;
  /**
   * The responses of the route.
   */
  responses?: Responses;
  /**
   * The request body of the route.
   */
  body?: RequestBody;
}

/**
 * The target method for the route decorator.
 *
 * All the parameters will be included in each incoming {@linkcode Request}.
 */
export type RouteDecoratorTarget<ResponseType> = (
  ctx: Context,
  params: unknown,
) => MaybePromise<Responses<ResponseType>>;

/**
 * The target method for the route decorator.
 *
 * All the parameters will be included in each incoming {@linkcode Request}.
 */
export type RouteDecoratorTargetWithBody<
  ResponseType,
  RequestBody,
> = (
  ctx: Context,
  params: unknown,
  body: RequestBody,
) => MaybePromise<Responses<ResponseType>>;

/**
 * The class method decorator for the route decorator.
 */
export type RouteMethodDecorator<ResponseType> = (
  target: RouteDecoratorTarget<ResponseType>,
  context: ClassMethodDecoratorContext,
) => void;

/**
 * The class method decorator for the route decorator with a body.
 */
export type RouteMethodDecoratorWithBody<ResponseType, RequestBody> = (
  target: RouteDecoratorTargetWithBody<ResponseType, RequestBody>,
  context: ClassMethodDecoratorContext,
) => void;
