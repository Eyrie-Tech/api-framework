// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.
import {
  buildRouteDecorator,
  type RouteMethodDecoratorWithBody,
} from "./route_decorators.ts";
import { HttpMethod, type RoutePath } from "./router.ts";
import type { ClassType } from "./utils.ts";

// TODO: fix example and add to actual example
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
export function Put<
  ResponseType extends ClassType,
  RequestBody extends ClassType,
>(
  options: PutOptions<ResponseType, RequestBody>,
): RouteMethodDecoratorWithBody<
  InstanceType<ResponseType>,
  InstanceType<RequestBody>
> {
  return buildRouteDecorator({
    ...options,
    method: HttpMethod.PUT,
  }) as RouteMethodDecoratorWithBody<
    InstanceType<ResponseType>,
    InstanceType<RequestBody>
  >;
}

/**
 * Options for registering a PUT request with the {@linkcode Put} decorator.
 */
export interface PutOptions<
  Responses extends ClassType,
  RequestBody extends ClassType,
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
   * The responses of the PUT route.
   */
  responses?: Responses;
  /**
   * The request body type of the PUT route.
   */
  body?: RequestBody;
}
