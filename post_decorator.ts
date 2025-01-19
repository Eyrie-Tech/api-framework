// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.
import {
  buildRouteDecorator,
  type RouteMethodDecoratorWithBody,
} from "./route_decorators.ts";
import { HttpMethod, type RoutePath } from "./router.ts";
import type { ClassType } from "./utils.ts";

// TODO: fix example and add to actual example
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
export function Post<
  ResponseType extends ClassType,
  RequestBody extends ClassType,
>(
  options: PostOptions<ResponseType, RequestBody>,
): RouteMethodDecoratorWithBody<
  InstanceType<ResponseType>,
  InstanceType<RequestBody>
> {
  return buildRouteDecorator({
    ...options,
    method: HttpMethod.POST,
  }) as RouteMethodDecoratorWithBody<
    InstanceType<ResponseType>,
    InstanceType<RequestBody>
  >;
}

/**
 * Options for registering a POST request with the {@linkcode Post} decorator.
 */
export interface PostOptions<
  Responses extends ClassType,
  RequestBody extends ClassType,
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
   * The responses of the POST route.
   */
  responses?: Responses;
  /**
   * The request body type of the POST route.
   */
  body?: RequestBody;
}
