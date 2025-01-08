// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import type { Injectable, InjectableDecorator } from "./registration.ts";
import { registerController, type RoutePath } from "./router.ts";
import type { ClassType } from "./utils.ts";

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
