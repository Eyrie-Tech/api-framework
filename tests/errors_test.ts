// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import { assertEquals, assertStrictEquals } from "@std/assert";
import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { setupApplication, setupPermissions } from "./utils/setup_utils.ts";
import {
  Controller,
  Get,
  HttpMethod,
  HttpResponse,
  HttpResponses,
  type Injectable,
  type InjectableRegistration,
  type Responses,
} from "@eyrie/app";
// TODO: get from app
import type { ErrorResponse } from "../response.ts";

Deno.test({
  name:
    "buildErrorResponse() returns an RFC-9457 compliant error when the handler throws an error",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    await using setup = await setupApplication([MessageController]);
    const url = new URL("/v1/error", setup.origin);

    // Act
    const response = await fetch(url, { method: HttpMethod.GET });

    // Assert
    assertStrictEquals(response.status, STATUS_CODE.InternalServerError);
    assertStrictEquals(
      response.statusText,
      STATUS_TEXT[STATUS_CODE.InternalServerError],
    );
    assertEquals(await response.json(), {
      detail: "kaboom",
      status: 500,
      title: "Internal Server Error",
    });
  },
});

Deno.test({
  name:
    "buildErrorResponse() returns an RFC-9457 compliant error when the handler throws a string error",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    await using setup = await setupApplication([MessageController]);
    const url = new URL("/v1/error-string", setup.origin);

    // Act
    const response = await fetch(url, { method: HttpMethod.GET });

    // Assert
    assertStrictEquals(response.status, STATUS_CODE.InternalServerError);
    assertStrictEquals(
      response.statusText,
      STATUS_TEXT[STATUS_CODE.InternalServerError],
    );
    assertEquals(await response.json(), {
      detail: "kaboom",
      status: 500,
      title: "Internal Server Error",
    });
  },
});

Deno.test({
  name:
    "buildErrorResponse() returns an RFC-9457 compliant Not Found error when a route path is not registered",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    await using setup = await setupApplication([MessageController]);
    const url = new URL("/v1/not-found", setup.origin);

    // Act
    const response = await fetch(url, { method: HttpMethod.GET });

    // Assert
    assertStrictEquals(response.status, STATUS_CODE.NotFound);
    assertStrictEquals(response.statusText, STATUS_TEXT[STATUS_CODE.NotFound]);
    assertEquals(await response.json(), {
      detail: "Route GET /v1/not-found not found",
      status: 404,
      title: "Not Found",
    });
  },
});

// TODO(jonnydgreen): should this be a method not supported error instead?
Deno.test({
  name:
    "buildErrorResponse() returns an RFC-9457 compliant Not Found error when a route method is not registered for a registered path",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    await using setup = await setupApplication([MessageController]);
    const url = new URL("/v1/error", setup.origin);

    // Act
    const response = await fetch(url, { method: HttpMethod.POST });

    // Assert
    assertStrictEquals(response.status, STATUS_CODE.NotFound);
    assertStrictEquals(response.statusText, STATUS_TEXT[STATUS_CODE.NotFound]);
    assertEquals<ErrorResponse>(await response.json(), {
      detail: "Route POST /v1/error not found",
      status: 404,
      title: "Not Found",
    });
  },
});

@HttpResponses({ description: "Responses" })
class BasicResponses {
  @HttpResponse({
    description: "Successful response",
    status: "OK",
    // TODO: support empty or void type
    type: String,
    resolver(response): boolean {
      return Array.isArray(response);
    },
  })
  ok!: string;
}

@Controller("/")
class MessageController implements Injectable {
  public register(): InjectableRegistration {
    return { dependencies: [] };
  }

  @Get({ description: "throwError", path: "/error", responses: BasicResponses })
  public throwError(): Responses<BasicResponses> {
    throw new Error("kaboom");
  }

  @Get({
    description: "throwErrorString",
    path: "/error-string",
    responses: BasicResponses,
  })
  public throwErrorString(): Responses<BasicResponses> {
    throw "kaboom";
  }
}
