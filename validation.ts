// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.
import type { ZodArray, ZodObject, ZodRawShape } from "zod";

// TODO(jonnydgreen): we most likely want custom types for this
export type { ZodObject, ZodRawShape, ZodTypeAny } from "zod";

type ValidationMetadata =
  | ZodObject<ZodRawShape>
  | ZodArray<ValidationMetadata, "many">;

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
