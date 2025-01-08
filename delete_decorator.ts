// TODO: remove ignore

import type { Context } from "./context.ts";
import { getRegistrationKey } from "./registration.ts";
import type { Responses } from "./response.ts";
import { RouteDecoratorError } from "./route_decorators.ts";
import { HttpMethod, registerRoute, type RoutePath } from "./router.ts";
import type { ClassType, MaybePromise } from "./utils.ts";

/**
 * Register a DELETE route with the provided options for the class method.
 *
 * Note, this will not work for private or static properties.
 *
 * @param options The options for registering a DELETE route.
 * @typeParam ResponseType The response type of the DELETE route.
 * @returns a decorator that will register the DELETE route
 * @example Usage
 * ```ts no-assert ignore
 * import { Controller, Delete, Injectable, InjectableRegistration } from "@eyrie/app";
 * @Controller('/messages')
 * class MessageController implements Injectable {
 *   register(): InjectableRegistration {
 *     return { dependencies: [] };
 *   }
 *   @Delete({ path: "/" })
 *   public getMessages(): string[] {
 *     return ["Hello", "Hiya"];
 *   }
 * }
 * ```
 */
export function Delete<ResponseType extends ClassType>(
  options: DeleteOptions<ResponseType>,
): DeleteMethodDecorator<InstanceType<ResponseType>> {
  return function deleteRoute(
    _target: DeleteDecoratorTarget<InstanceType<ResponseType>>,
    context: ClassMethodDecoratorContext,
  ): void {
    const methodName = context.name;
    const key = Symbol(String(methodName));
    context.addInitializer(function (this: unknown) {
      const thisArg = this as ClassType;
      if (context.private || context.static) {
        throw new RouteDecoratorError(
          `Delete() registration failed for '${thisArg?.name}.${
            String(methodName)
          }': private and static field registration is unsupported`,
        );
      }
      const classKey = getRegistrationKey(thisArg.constructor);
      registerRoute(key, {
        method: HttpMethod.DELETE,
        path: options.path,
        controller: classKey,
        methodName: methodName,
      });
    });
  };
}

/**
 * Options for registering a DELETE request with the {@linkcode Delete} decorator.
 */
export interface DeleteOptions<Responses extends ClassType> {
  /**
   * The description of the DELETE route.
   */
  description: string;
  /**
   * The path to register the DELETE route for.
   * This will be prefixed by the controller path.
   */
  path: RoutePath;
  /**
   * The responses of the DELETE route.
   */
  responses?: Responses;
}

/**
 * The DELETE method for the {@linkcode Delete} decorator.
 *
 * All the parameters will be included in each incoming {@linkcode Request}.
 */
export type DeleteDecoratorTarget<
  ResponseType,
> = (
  ctx: Context,
  params: unknown,
) => MaybePromise<Responses<ResponseType>>;

/**
 * The DELETE method decorator for the {@linkcode Delete} decorator.
 */
export type DeleteMethodDecorator<ResponseType> = (
  target: DeleteDecoratorTarget<ResponseType>,
  context: ClassMethodDecoratorContext,
) => void;
