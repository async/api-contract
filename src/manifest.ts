import { defineFeatureCatalog } from "./catalog.js";
import { createSurface } from "./surface.js";
import type { FeatureCatalog, PackageContractManifest, Surface, UsageSurface } from "./model.js";

export function parsePackageContractManifest(value: unknown): PackageContractManifest {
  assertObject(value, "PackageContractManifest");
  if (value.format !== "api-contract.package.v1") {
    throw new Error("PackageContractManifest.format must be api-contract.package.v1");
  }
  assertNonEmptyString(value.packageName, "PackageContractManifest.packageName");

  return {
    ...copyExtensionFields(value),
    format: "api-contract.package.v1",
    packageName: value.packageName,
    ...(value.catalogs === undefined ? {} : { catalogs: parseArray(value.catalogs, "catalogs").map((catalog) => defineFeatureCatalog(catalog as FeatureCatalog)) }),
    ...(value.supported === undefined ? {} : { supported: parseArray(value.supported, "supported").map(parseSurface) }),
    ...(value.required === undefined ? {} : { required: parseArray(value.required, "required").map(parseSurface) }),
    ...(value.emits === undefined ? {} : { emits: parseArray(value.emits, "emits").map(parseSurface) }),
    ...(value.usage === undefined ? {} : { usage: parseArray(value.usage, "usage").map((usage) => usage as UsageSurface) })
  };
}

function parseSurface(value: unknown): Surface {
  assertObject(value, "Surface");
  if (value.format !== "api-contract.surface.v1") {
    throw new Error("Surface.format must be api-contract.surface.v1");
  }
  assertNonEmptyString(value.contractId, "Surface.contractId");
  const features = parseArray(value.features, "Surface.features");
  for (const feature of features) assertNonEmptyString(feature, "Surface.features[]");
  const meta = value.meta === undefined ? undefined : value.meta as Record<string, unknown>;
  const surface = meta === undefined
    ? createSurface({ contractId: value.contractId, features: features as string[] })
    : createSurface({ contractId: value.contractId, features: features as string[], meta });
  if (typeof value.hash === "string" && value.hash !== surface.hash) {
    throw new Error(`Surface.hash mismatch for ${value.contractId}: expected ${surface.hash}, got ${value.hash}`);
  }
  return surface;
}

function parseArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
  return value;
}

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function assertNonEmptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function copyExtensionFields(value: Record<string, unknown>): Record<`x-${string}`, unknown> {
  const out: Record<`x-${string}`, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key.startsWith("x-")) out[key as `x-${string}`] = entry;
  }
  return out;
}
