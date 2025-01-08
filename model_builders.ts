// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.
// Some variables are genuinely not used
// deno-lint-ignore-file no-unused-vars

import * as z from "zod";
import { ClassRegistrationType, registerClass } from "./registration.ts";
import { type ClassType, exists, type MapType } from "./utils.ts";
import { getValidationModel, registerValidationModel } from "./validation.ts";
import { getRegistrationKey } from "./registration.ts";

const listKey = Symbol("eyrie.list");

// TODO: remove ignore
/**
 * Register a List type
 * @param itemsType The List items type
 * @returns The {@linkcode List} Type
 * @typeParam ItemsType The type of the list items.
 * @example Usage
 * ```ts ignore
 * import { ObjectType, Field, List } from "@eyrie/app";
 * @ObjectType({ description: "Message" })
 * class Message {
 *   @Field({ description: "Details of the Message.", type: List(String) })
 *   details!: string[];
 * }
 * ```
 */
export function List<ItemsType>(itemsType: ItemsType): MapType<ItemsType>[] {
  class ListDef<T> {
    readonly [listKey] = true;
    readonly itemsType: T = itemsType as unknown as T;
  }
  // TODO: maybe have a different type
  const key = registerClass({
    type: ClassRegistrationType.ObjectType,
    target: ListDef,
  });
  // TODO: maybe we can avoid this cast by returning the exact type and instead
  // perform the mappings in the internal decorator. This will avoid any potential pitfalls
  // in the future. Idea: think about how GraphQL does it.
  const itemsTypeKey = getRegistrationKey(itemsType);
  const itemsTypeValidation = getValidationModel(itemsTypeKey);
  if (!exists(itemsTypeValidation)) {
    throw new ModelBuilderError(
      `Model building failed for 'List(${itemsTypeKey.description})': no validation schema exists for array item type '${itemsTypeKey.description}'`,
    );
  }
  registerValidationModel(key, z.array(itemsTypeValidation));
  return ListDef as unknown as MapType<ItemsType>[];
}

// TODO: investigate and remove ignore
/**
 * Indicator for whether an input is a {@linkcode List} type.
 * @param input The input to test
 * @returns Whether the input is a {@linkcode List} type
 * @example Usage
 * ```ts ignore
 * import { List, isListType } from "@eyrie/app";
 * import { Message } from "@examples/basic/basic_model.ts"
 * import { assert } from "@std/assert";
 *
 * const result = isListType(List(Message))
 *
 * assert(result)
 * ```
 */
export function isListType(input: unknown): boolean {
  return !!(input as Record<symbol, symbol>)?.[listKey];
}

/**
 * A model builder error that can be thrown when building a model.
 *
 * @example Usage
 * ```ts
 * import { ModelBuilderError } from "@eyrie/app";
 * import { assert } from "@std/assert";
 *
 * const error = new ModelBuilderError()
 * assert(error instanceof Error);
 * assert(typeof error.message === "string");
 * ```
 */
export class ModelBuilderError extends Error {
  /**
   * The name of the error.
   * @example Usage
   * ```ts
   * import { ModelBuilderError } from "@eyrie/app";
   * import { assert } from "@std/assert";
   *
   * const error = new ModelBuilderError()
   * assert(error.name === "ModelBuilderError");
   * ```
   */
  override readonly name = "ModelBuilderError";
}
