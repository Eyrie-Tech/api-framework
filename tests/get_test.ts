// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import {
  type Context,
  Controller,
  Get,
  HttpMethod,
  HttpResponse,
  HttpResponses,
  type InjectableRegistration,
  type Responses,
  RouteDecoratorError,
} from "@eyrie/app";
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { createControllerWithGetRoute } from "./utils/controller_utils.ts";
import { setupApplication, setupPermissions } from "./utils/setup_utils.ts";

Deno.test({
  name: "Get() registers a GET route",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    const { controller } = createControllerWithGetRoute(
      "/messages",
      { path: "/" },
      () => [
        { id: "1", content: "Hello" },
        { id: "2", content: "Hiya" },
      ],
    );
    await using setup = await setupApplication([controller]);
    const url = new URL("/v1/messages", setup.origin);

    // Act
    const response = await fetch(url, { method: HttpMethod.GET });

    // Assert
    assertStrictEquals(response.status, STATUS_CODE.OK);
    assertStrictEquals(response.statusText, STATUS_TEXT[STATUS_CODE.OK]);
    assertEquals(await response.json(), [
      {
        id: "1",
        content: "Hello",
      },
      {
        id: "2",
        content: "Hiya",
      },
    ]);
  },
});

Deno.test({
  name: "Get() throws an error if registered on a static route",
  permissions: setupPermissions(),
  fn() {
    // Arrange, Act & Assert
    assertThrows(
      () => {
        @Controller("/")
        // deno-lint-ignore no-unused-vars
        class StaticController {
          public register(): InjectableRegistration {
            return { dependencies: [] };
          }

          @Get({
            description: "Get route",
            path: "/static",
            responses: BasicResponses,
          })
          public static getRoute(
            _ctx: Context,
            _params: unknown,
          ): Responses<BasicResponses> {
            return "getRoute";
          }
        }
      },
      RouteDecoratorError,
      "Get() registration failed for 'StaticController.getRoute': private and static field registration is unsupported",
    );
  },
});

@HttpResponses({ description: "Responses" })
class BasicResponses {
  @HttpResponse({
    description: "Successful response",
    status: "OK",
    type: String,
    resolver(response): boolean {
      return Array.isArray(response);
    },
  })
  ok!: string;
}
