// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import {
  type ClassType,
  type Context,
  Controller,
  Get,
  type GetOptions,
  type Injectable,
  type InjectableRegistration,
  Post,
  type PostOptions,
  type RoutePath,
} from "@eyrie/app";

export interface ControllerHandlerInput {
  ctx: Context | undefined;
  params: unknown | undefined;
  body?: unknown;
}

interface ControllerResult {
  controller: ClassType<Injectable>;
  input: ControllerHandlerInput;
}

export function createControllerWithPostRoute(
  controllerPath: RoutePath,
  options: PostOptions<ClassType, ClassType>,
  handler?: (
    ctx: Context,
    params: unknown,
    body: unknown,
  ) => void,
): ControllerResult {
  const input: ControllerHandlerInput = {
    ctx: undefined,
    params: undefined,
  };
  @Controller(controllerPath)
  class BaseController implements Injectable {
    public register(): InjectableRegistration {
      return { dependencies: [] };
    }

    @Post(options)
    public postRoute(
      ctx: Context,
      params: unknown,
      body: unknown,
    ): unknown {
      input.ctx = ctx;
      input.params = params;
      input.body = body;
      if (handler) {
        return handler(input.ctx, input.params, input.body);
      }
    }
  }
  return { controller: BaseController, input };
}

export function createControllerWithGetRoute<Responses extends ClassType>(
  controllerPath: RoutePath,
  options: Pick<GetOptions<Responses>, "path">,
  handler?: (ctx: Context, params: unknown) => void,
): ControllerResult {
  const input: ControllerHandlerInput = {
    ctx: undefined,
    params: undefined,
  };
  @Controller(controllerPath)
  class BaseController implements Injectable {
    public register(): InjectableRegistration {
      return { dependencies: [] };
    }
    // TODO: the responses type here
    // deno-lint-ignore no-explicit-any
    @Get({ ...options, description: "Get route", responses: String as any })
    public getRoute(
      ctx: Context,
      params: unknown,
    ): unknown {
      input.ctx = ctx;
      input.params = params;
      if (handler) {
        return handler(ctx, params);
      }
    }
  }
  return { controller: BaseController, input };
}
