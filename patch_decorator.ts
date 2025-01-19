// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.
import {
  buildRouteDecorator,
  type RouteMethodDecoratorWithBody,
} from "./route_decorators.ts";
import { HttpMethod, type RoutePath } from "./router.ts";
import type { ClassType } from "./utils.ts";

// TODO: fix example and add to actual example
/**
 * Register a PATCH route with the provided options for the class method.
 *
 * Note, this will not work for private or static properties.
 *
 * @param options The options for registering a PATCH route.
 * @typeParam RequestBody The request body type of the PATCH route.
 * @typeParam ResponseType The response type of the PATCH route.
 * @returns a decorator that will register the PATCH route
 * @example Usage
 * ```ts no-assert
 * import { Controller, Patch, Injectable, InjectableRegistration } from "@eyrie/app";
 *
 * @Controller('/messages')
 * class MessageController implements Injectable {
 *   register(): InjectableRegistration {
 *     return { dependencies: [] };
 *   }
 *   @Patch({ description: "Create Message", path: "/" })
 *   public createMessage(): void {
 *     // Create message
 *   }
 * }
 * ```
 */
export function Patch<
  ResponseType extends ClassType,
  RequestBody extends ClassType,
>(
  options: PatchOptions<ResponseType, RequestBody>,
): RouteMethodDecoratorWithBody<
  InstanceType<ResponseType>,
  InstanceType<RequestBody>
> {
  return buildRouteDecorator({
    ...options,
    method: HttpMethod.PATCH,
  }) as RouteMethodDecoratorWithBody<
    InstanceType<ResponseType>,
    InstanceType<RequestBody>
  >;
}

/**
 * Options for registering a PATCH request with the {@linkcode Patch} decorator.
 */
export interface PatchOptions<
  Responses extends ClassType,
  RequestBody extends ClassType,
> {
  /**
   * The description of the PATCH route.
   */
  description: string;
  /**
   * The path to register the PATCH route for.
   * This will be prefixed by the controller path.
   */
  path: RoutePath;
  /**
   * The responses of the PATCH route.
   */
  responses?: Responses;
  /**
   * The request body type of the PATCH route.
   */
  body?: RequestBody;
}
