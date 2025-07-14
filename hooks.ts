import { assertNever } from "./utils";

const applicationHooks = [
  "onStart",
] as const;
export type ApplicationHook = typeof applicationHooks[number];

const lifecycleHooks = [
  "onRequest",
] as const;
export type LifecycleHook = typeof lifecycleHooks[number];

const supportedHooks: Hook[] = [...lifecycleHooks, ...applicationHooks];
export type Hook = ApplicationHook | LifecycleHook;

// TODO: add status support
class EyrieHookInvalidType extends Error {
  override readonly name = "EyrieHookInvalidType";
}

// TODO: add status support
class EyrieHookInvalidHandler extends Error {
  override readonly name = "EyrieHookInvalidHandler";
}

// TODO: add status support
class EyrieHookUnsupportedHook extends Error {
  override readonly name = "EyrieHookUnsupportedHook";

  constructor(hook: string) {
    super(`Unsupported hook: ${hook}`);
  }
}

export type Handler = Function;

export class Hooks {
  readonly #onRequest: Handler[] = [];
  readonly #onStart: Handler[] = [];

  validate(hook: Hook, fn: Handler): void {
    if (typeof hook !== "string") {
      throw new EyrieHookInvalidType();
    }
    if (typeof fn !== "function") {
      throw new EyrieHookInvalidHandler();
    }
    if (supportedHooks.indexOf(hook) === -1) {
      throw new EyrieHookUnsupportedHook(hook);
    }
  }

  add(hook: Hook, fn: Handler): void {
    this.validate(hook, fn);
    switch (hook) {
      // Application Hooks
      case "onStart": {
        this.#onStart.push(fn);
        break;
      }
      // Lifecycle Hooks
      case "onRequest": {
        this.#onRequest.push(fn);
        break;
      }
      default: {
        assertNever(hook, new EyrieHookUnsupportedHook(hook));
      }
    }
  }

  static async hooksRunner(
    functions: Handler[],
    runner: Function,
    request: Request,
  ): Promise<void> {
    for (const fn of functions) {
      await runner(fn, request);
    }
  }

  static hookRunner(fn: Handler, request: Request): Promise<void> {
    return fn(request);
  }
}
