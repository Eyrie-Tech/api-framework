// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import {
  buildRouteDecorator,
  type RouteMethodDecorator,
} from "./route_decorators.ts";
import { HttpMethod, type RoutePath } from "./router.ts";
import type { ClassType } from "./utils.ts";

// TODO: fix example and add to actual example
/**
 * Register a OPTIONS route with the provided options for the class method.
 *
 * Note, this will not work for private or static properties.
 *
 * @param options The options for registering a OPTIONS route.
 * @typeParam ResponseType The response type of the OPTIONS route.
 * @returns a decorator that will register the OPTIONS route
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
export function Options<ResponseType extends ClassType>(
  options: OptionsOptions<ResponseType>,
): RouteMethodDecorator<InstanceType<ResponseType>> {
  return buildRouteDecorator({ ...options, method: HttpMethod.OPTIONS });
}

/**
 * Options for registering a OPTIONS request with the {@linkcode Options} decorator.
 */
export interface OptionsOptions<Responses extends ClassType> {
  /**
   * The description of the OPTIONS route.
   */
  description: string;
  /**
   * The path to register the OPTIONS route for.
   * This will be prefixed by the controller path.
   */
  path: RoutePath;
  /**
   * The responses of the OPTIONS route.
   */
  responses?: Responses;
}
