// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import { createLogger, type LevelName, type Logger } from "./logger.ts";

/**
 * The server context. This is created for the Application instance
 * and contains crucial application-specific information and functionality
 * to be used throughout the lifetime of the Application.
 *
 * @example Usage
 * ```ts
 * import { ServerContext } from "@eyrie/app";
 * import { assert } from "@std/assert";
 *
 * const ctx = new ServerContext("INFO");
 * assert(ctx.log.levelName === "INFO");
 * ```
 */
export class ServerContext {
  /**
   * A logger instance scoped to the Application
   * @example Usage
   * ```ts
   * import { ServerContext } from "@eyrie/app";
   * import { assert } from "@std/assert";
   *
   * const ctx = new ServerContext("INFO");
   * assert(ctx.log.levelName === "INFO");
   * ```
   */
  readonly log: Readonly<Logger>;

  /**
   * The server context. This is created for the Application instance
   * and contains crucial application-specific information and functionality
   * to be used throughout the lifetime of the Application.
   *
   * @param levelName The log level of the {@linkcode Logger} for the {@linkcode ServerContext}.
   */
  constructor(levelName: LevelName) {
    this.log = createLogger(levelName);
  }
}

/**
 * The request context. This is created for every incoming {@linkcode Request}
 * and contains crucial request-specific information and functionality
 * to be used by the handler of the request.
 *
 * @example Usage
 * ```ts
 * import { Context, ServerContext } from "@eyrie/app";
 * import { assert } from "@std/assert";
 *
 * const serverContext = new ServerContext("INFO");
 * const request = new Request("http://example.com");
 *
 * const ctx = new Context(serverContext, request)
 * assert(ctx.log === serverContext.log);
 * assert(ctx.request === request);
 * ```
 */
export class Context {
  /**
   * A logger instance scoped to the {@linkcode Request}.
   *
   * @example Usage
   * ```ts
   * import { Context, ServerContext } from "@eyrie/app";
   * import { assert } from "@std/assert";
   *
   * const serverContext = new ServerContext("INFO");
   * const request = new Request("http://example.com");
   *
   * const ctx = new Context(serverContext, request)
   * assert(ctx.log === serverContext.log);
   * ```
   */
  readonly log: Readonly<Logger>;

  /**
   * The incoming request instance.
   *
   * @example Usage
   * ```ts
   * import { Context, ServerContext } from "@eyrie/app";
   * import { assert } from "@std/assert";
   *
   * const serverContext = new ServerContext("INFO");
   * const request = new Request("http://example.com");
   *
   * const ctx = new Context(serverContext, request)
   * assert(ctx.request === request);
   * ```
   */
  readonly request: Readonly<Request>;

  /**
   * The request context. This is created for every incoming {@linkcode Request}
   * and contains crucial request-specific information and functionality
   * to be used by the handler of the request.
   *
   * @param ctx The {@linkcode ServerContext} that is scoped to the Application.
   * @param request The incoming {@linkcode Request} that is scoped to the {@linkcode Context}.
   */
  constructor(
    ctx: ServerContext,
    request: Request,
  ) {
    // TODO(jonnydgreen): create child logger with correlation ID
    this.log = ctx.log;
    this.request = request;
  }
}
