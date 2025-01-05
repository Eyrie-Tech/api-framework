// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import {
  type Context,
  Controller,
  DriverError,
  Field,
  Get,
  HttpMethod,
  HttpResponse,
  HttpResponses,
  type Injectable,
  type InjectableRegistration,
  ObjectType,
  Post,
  type Responses,
  RouterError,
  Service,
} from "@eyrie/app";
import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { STATUS_CODE, STATUS_TEXT } from "@std/http";
import type { ControllerHandlerInput } from "./utils/controller_utils.ts";
import { setupApplication, setupPermissions } from "./utils/setup_utils.ts";

Deno.test({
  name:
    "Router() supports different HTTP route registrations for the same path on the same controller",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    const getInput: ControllerHandlerInput = {
      ctx: undefined,
      params: undefined,
    };
    const postInput: ControllerHandlerInput = {
      ctx: undefined,
      params: undefined,
      body: undefined,
    };
    const getOutput = { get: true, post: false };
    const postOutput = { get: false, post: true };
    const postBody = { post: "body" };
    @ObjectType({ description: "The Message." })
    class BasicResponse {
      @Field({ description: "", type: Boolean })
      get!: boolean;
      @Field({ description: "", type: Boolean })
      post!: boolean;
    }

    @HttpResponses({ description: "Responses" })
    class BasicResponses {
      @HttpResponse({
        description: "Successful response",
        status: "OK",
        type: BasicResponse,
        resolver(response): boolean {
          return Array.isArray(response);
        },
      })
      ok!: BasicResponse;
    }
    @Controller("/same-controller")
    class SameController implements Injectable {
      public register(): InjectableRegistration {
        return { dependencies: [] };
      }

      @Get({
        description: "Get route",
        path: "/same-path",
        responses: BasicResponses,
      })
      public getRoute(
        ctx: Context,
        params: unknown,
      ): Responses<BasicResponses> {
        getInput.ctx = ctx;
        getInput.params = params;
        return getOutput;
      }

      @Post({ path: "/same-path" })
      public postRoute(ctx: Context, params: unknown, body: unknown): unknown {
        postInput.ctx = ctx;
        postInput.params = params;
        postInput.body = body;
        return postOutput;
      }
    }
    await using setup = await setupApplication([SameController]);
    const url = new URL("/v1/same-controller/same-path", setup.origin);

    // Act
    const getResponse = await fetch(url, { method: HttpMethod.GET });
    const postResponse = await fetch(url, {
      method: HttpMethod.POST,
      body: JSON.stringify(postBody),
    });

    // Assert
    assertStrictEquals(getResponse.status, STATUS_CODE.OK);
    assertStrictEquals(getResponse.statusText, STATUS_TEXT[STATUS_CODE.OK]);
    assertEquals(await getResponse.json(), getOutput);
    assertStrictEquals(postResponse.status, STATUS_CODE.OK);
    assertStrictEquals(postResponse.statusText, STATUS_TEXT[STATUS_CODE.OK]);
    assertEquals(await postResponse.json(), postOutput);
  },
});

Deno.test({
  name: "Router() supports route registrations with no response body",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    const input: ControllerHandlerInput = {
      ctx: undefined,
      params: undefined,
      body: undefined,
    };
    const body = { post: "body" };
    @Controller("/")
    class SameController implements Injectable {
      public register(): InjectableRegistration {
        return { dependencies: [] };
      }

      @Post({ path: "/no-response" })
      public postRoute(ctx: Context, params: unknown, body: unknown): void {
        input.ctx = ctx;
        input.params = params;
        input.body = body;
      }
    }
    await using setup = await setupApplication([SameController]);
    const url = new URL("/v1/no-response", setup.origin);

    // Act
    const response = await fetch(url, {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
    });

    // Assert
    assertStrictEquals(response.status, STATUS_CODE.OK);
    assertStrictEquals(response.statusText, STATUS_TEXT[STATUS_CODE.OK]);
    assertEquals(await response.text(), "");
  },
});

Deno.test({
  name: "Router() throws an error if a route is not registered on a controller",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    @Service()
    class NotController implements Injectable {
      public register(): InjectableRegistration {
        return { dependencies: [] };
      }

      @Get({
        description: "Route 1",
        path: "/not-controller",
        responses: BasicResponses,
      })
      public route1(): string {
        return "route1";
      }
    }

    // Act & Assert
    await assertRejects(
      () => setupApplication([NotController]),
      RouterError,
      "Controller 'NotController' does not exist for route: GET /not-controller",
    );
  },
});

Deno.test({
  name:
    "Router() throws a route already registered error when a duplicate route is defined on the same controller",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    @Controller("/same-controller")
    class DuplicateSameController implements Injectable {
      public register(): InjectableRegistration {
        return { dependencies: [] };
      }

      @Get({
        description: "Route 1",
        path: "/duplicate",
        responses: BasicResponses,
      })
      public route1() {
        return "route1";
      }

      @Get({
        description: "Route 2",
        path: "/duplicate",
        responses: BasicResponses,
      })
      public route2() {
        return "route2";
      }
    }

    // Act & Assert
    await assertRejects(
      () => setupApplication([DuplicateSameController]),
      DriverError,
      "Route GET /v1/same-controller/duplicate already registered",
    );
  },
});

Deno.test({
  name:
    "Router() throws a route already registered error when a duplicate route is defined on a different controller",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    @Controller("/different-controller")
    class DuplicateDifferentController1 implements Injectable {
      public register(): InjectableRegistration {
        return { dependencies: [] };
      }

      @Get({
        description: "Route",
        path: "/duplicate",
        responses: BasicResponses,
      })
      public route() {
        return "";
      }
    }
    @Controller("/different-controller")
    class DuplicateDifferentController2 implements Injectable {
      public register(): InjectableRegistration {
        return { dependencies: [] };
      }

      @Get({
        description: "Route",
        path: "/duplicate",
        responses: BasicResponses,
      })
      public route() {
        return "";
      }
    }

    // Act & Assert
    await assertRejects(
      () =>
        setupApplication([
          DuplicateDifferentController1,
          DuplicateDifferentController2,
        ]),
      DriverError,
      "Route GET /v1/different-controller/duplicate already registered",
    );
  },
});

Deno.test({
  name:
    "Router() throws an error when a non-InputType class is used for the request body definition",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    @ObjectType({ description: "description" })
    class InvalidBody {}

    @Controller("/")
    class NonInputTypeController implements Injectable {
      public register(): InjectableRegistration {
        return { dependencies: [] };
      }

      @Post({ path: "/non-input-type", body: InvalidBody })
      public route() {
        return "";
      }
    }

    // Act & Assert
    await assertRejects(
      () => setupApplication([NonInputTypeController]),
      RouterError,
      "Registered class is not registered as an InputType for key: InvalidBody",
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
