// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.
import type { ZodArray, ZodObject, ZodRawShape, ZodTypeAny } from "zod";

// TODO(jonnydgreen): we most likely want custom types for this
export type { ZodArray, ZodObject, ZodRawShape, ZodTypeAny } from "zod";

export type ValidationMetadata =
  | ZodObject<ZodRawShape>
  | ZodArray<ValidationMetadata, "many">;

/**
 * The type info schema used in {@linkcode TypeInfo}.
 */
export type TypeInfoSchema<Type extends ZodRawShape> = ZodObject<
  Type,
  "strip",
  ZodTypeAny,
  Type,
  Type
>;

/**
 * The type information returned by {@linkcode getRootTypeInfo}.
 */
export interface TypeInfo<Type extends ZodRawShape> {
  /**
   * The registration key of the type information.
   */
  key: symbol;
  /**
   * The schema of the of the type information.
   */
  schema: TypeInfoSchema<Type>;
}

const models = new Map<symbol, ValidationMetadata>();

export function getValidationModel(
  key: symbol,
): ValidationMetadata | undefined {
  // const itemsTypeKey = maybeGetRegistrationKey(key);
  return models.get(key);
}

export function registerValidationModel(
  key: symbol,
  metadata: ValidationMetadata,
): void {
  models.set(key, metadata);
}
