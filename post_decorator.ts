import type { Context } from "./context.ts";
import { getRegistrationKey } from "./registration.ts";
import { RouteDecoratorError } from "./route_decorators.ts";
import { HttpMethod, registerRoute, type RoutePath } from "./router.ts";
import type { ClassType, MaybeClassType, MaybePromise } from "./utils.ts";

/**
 * Register a POST route with the provided options for the class method.
 *
 * Note, this will not work for private or static properties.
 *
 * @param options The options for registering a POST route.
 * @typeParam RequestBody The request body type of the POST route.
 * @typeParam ResponseType The response type of the POST route.
 * @returns a decorator that will register the POST route
 * @example Usage
 * ```ts no-assert
 * import { Controller, Post, Injectable, InjectableRegistration } from "@eyrie/app";
 *
 * @Controller('/messages')
 * class MessageController implements Injectable {
 *   register(): InjectableRegistration {
 *     return { dependencies: [] };
 *   }
 *   @Post({ description: "Create Message", path: "/" })
 *   public createMessage(): void {
 *     // Create message
 *   }
 * }
 * ```
 */
export function Post<RequestBody, ResponseType>(
  options: PostOptions<
    MaybeClassType<RequestBody>,
    MaybeClassType<ResponseType>
  >,
): PostMethodDecorator<RequestBody, ResponseType> {
  return function post(
    _target: PostDecoratorTarget<RequestBody, ResponseType>,
    context: ClassMethodDecoratorContext,
  ): void {
    const methodName = context.name;
    const key = Symbol(String(methodName));
    context.addInitializer(function (this: unknown) {
      const thisArg = this as ClassType;
      if (context.private || context.static) {
        throw new RouteDecoratorError(
          `Post() registration failed for '${thisArg?.name}.${
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
        method: HttpMethod.POST,
        path: options.path,
        controller: classKey,
        methodName: methodName,
        body,
      });
    });
  };
}

/**
 * Options for registering a POST request with the {@linkcode Post} decorator.
 */
export interface PostOptions<
  RequestBody = unknown,
  ResponseType = unknown,
> {
  /**
   * The description of the POST route.
   */
  description: string;
  /**
   * The path to register the POST route for.
   * This will be prefixed by the controller path.
   */
  path: RoutePath;
  /**
   * The request body type of the POST route.
   */
  body?: RequestBody;
  /**
   * The response type of the POST route.
   */
  response?: ResponseType;
}

/**
 * The POST method for the {@linkcode Post} decorator.
 *
 * All the parameters will be included in each incoming {@linkcode Request}.
 */
export type PostDecoratorTarget<
  RequestBody,
  ResponseType,
> = (
  ctx: Context,
  params: unknown,
  body: RequestBody,
) => MaybePromise<ResponseType>;

/**
 * The POST method decorator for the {@linkcode Post} decorator.
 */
export type PostMethodDecorator<RequestBody, ResponseType> = (
  target: PostDecoratorTarget<RequestBody, ResponseType>,
  context: ClassMethodDecoratorContext,
) => void;
