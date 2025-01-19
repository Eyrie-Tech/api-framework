// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import {
  buildRouteDecorator,
  type RouteMethodDecorator,
} from "./route_decorators.ts";
import { HttpMethod, type RoutePath } from "./router.ts";
import type { ClassType } from "./utils.ts";

// TODO: fix example and add to actual example
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
 *   public deleteMessage(): string[] {
 *     return ["Hello", "Hiya"];
 *   }
 * }
 * ```
 */
export function Delete<ResponseType extends ClassType>(
  options: DeleteOptions<ResponseType>,
): RouteMethodDecorator<InstanceType<ResponseType>> {
  return buildRouteDecorator({ ...options, method: HttpMethod.DELETE });
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
