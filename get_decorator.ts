// TODO: remove ignore

import type { Context } from "./context.ts";
import { getRegistrationKey } from "./registration.ts";
import type { Responses } from "./response.ts";
import { RouteDecoratorError } from "./route_decorators.ts";
import { HttpMethod, registerRoute, type RoutePath } from "./router.ts";
import type { ClassType, MaybePromise } from "./utils.ts";

/**
 * Register a GET route with the provided options for the class method.
 *
 * Note, this will not work for private or static properties.
 *
 * @param options The options for registering a GET route.
 * @typeParam ResponseType The response type of the GET route.
 * @returns a decorator that will register the GET route
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
export function Get<ResponseType extends ClassType>(
  options: GetOptions<ResponseType>,
): GetMethodDecorator<InstanceType<ResponseType>> {
  return function get(
    _target: GetDecoratorTarget<InstanceType<ResponseType>>,
    context: ClassMethodDecoratorContext,
  ): void {
    const methodName = context.name;
    const key = Symbol(String(methodName));
    context.addInitializer(function (this: unknown) {
      const thisArg = this as ClassType;
      if (context.private || context.static) {
        throw new RouteDecoratorError(
          `Get() registration failed for '${thisArg?.name}.${
            String(methodName)
          }': private and static field registration is unsupported`,
        );
      }
      const classKey = getRegistrationKey(thisArg.constructor);
      registerRoute(key, {
        method: HttpMethod.GET,
        path: options.path,
        controller: classKey,
        methodName: methodName,
      });
    });
  };
}

/**
 * Options for registering a GET request with the {@linkcode Get} decorator.
 */
export interface GetOptions<Responses extends ClassType> {
  /**
   * The description of the GET route.
   */
  description: string;
  /**
   * The path to register the GET route for.
   * This will be prefixed by the controller path.
   */
  path: RoutePath;
  /**
   * The responses of the GET route.
   */
  responses?: Responses;
}

/**
 * The GET method for the {@linkcode Get} decorator.
 *
 * All the parameters will be included in each incoming {@linkcode Request}.
 */
export type GetDecoratorTarget<
  ResponseType,
> = (
  ctx: Context,
  params: unknown,
) => MaybePromise<Responses<ResponseType>>;

/**
 * The GET method decorator for the {@linkcode Get} decorator.
 */
export type GetMethodDecorator<ResponseType> = (
  target: GetDecoratorTarget<ResponseType>,
  context: ClassMethodDecoratorContext,
) => void;
