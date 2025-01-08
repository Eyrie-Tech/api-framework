// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.
import type { Context } from "./context.ts";
import { getRegistrationKey } from "./registration.ts";
import { RouteDecoratorError } from "./route_decorators.ts";
import { HttpMethod, registerRoute, type RoutePath } from "./router.ts";
import type { ClassType, MaybeClassType, MaybePromise } from "./utils.ts";

/**
 * Register a PUT route with the provided options for the class method.
 *
 * Note, this will not work for private or static properties.
 *
 * @param options The options for registering a PUT route.
 * @typeParam RequestBody The request body type of the PUT route.
 * @typeParam ResponseType The response type of the PUT route.
 * @returns a decorator that will register the PUT route
 * @example Usage
 * ```ts no-assert
 * import { Controller, Put, Injectable, InjectableRegistration } from "@eyrie/app";
 *
 * @Controller('/messages')
 * class MessageController implements Injectable {
 *   register(): InjectableRegistration {
 *     return { dependencies: [] };
 *   }
 *   @Put({ description: "Create Message", path: "/" })
 *   public createMessage(): void {
 *     // Create message
 *   }
 * }
 * ```
 */
export function Put<RequestBody, ResponseType>(
  options: PutOptions<
    MaybeClassType<RequestBody>,
    MaybeClassType<ResponseType>
  >,
): PutMethodDecorator<RequestBody, ResponseType> {
  return function put(
    _target: PutDecoratorTarget<RequestBody, ResponseType>,
    context: ClassMethodDecoratorContext,
  ): void {
    const methodName = context.name;
    const key = Symbol(String(methodName));
    context.addInitializer(function (this: unknown) {
      const thisArg = this as ClassType;
      if (context.private || context.static) {
        throw new RouteDecoratorError(
          `Put() registration failed for '${thisArg?.name}.${
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
        method: HttpMethod.PUT,
        path: options.path,
        controller: classKey,
        methodName: methodName,
        body,
      });
    });
  };
}

/**
 * Options for registering a PUT request with the {@linkcode Put} decorator.
 */
export interface PutOptions<
  RequestBody = unknown,
  ResponseType = unknown,
> {
  /**
   * The description of the PUT route.
   */
  description: string;
  /**
   * The path to register the PUT route for.
   * This will be prefixed by the controller path.
   */
  path: RoutePath;
  /**
   * The request body type of the PUT route.
   */
  body?: RequestBody;
  /**
   * The response type of the PUT route.
   */
  response?: ResponseType;
}

/**
 * The PUT method for the {@linkcode Put} decorator.
 *
 * All the parameters will be included in each incoming {@linkcode Request}.
 */
export type PutDecoratorTarget<
  RequestBody,
  ResponseType,
> = (
  ctx: Context,
  params: unknown,
  body: RequestBody,
) => MaybePromise<ResponseType>;

/**
 * The PUT method decorator for the {@linkcode Put} decorator.
 */
export type PutMethodDecorator<RequestBody, ResponseType> = (
  target: PutDecoratorTarget<RequestBody, ResponseType>,
  context: ClassMethodDecoratorContext,
) => void;
