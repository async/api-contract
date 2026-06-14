import type { FeatureCatalog, FeatureSpec } from "./model.js";

const releaseTags = new Set(["public", "beta", "alpha", "internal"]);
const lifecycles = new Set(["active", "deprecated", "removed"]);

export function defineFeatureCatalog(catalog: FeatureCatalog): FeatureCatalog {
  assertObject(catalog, "catalog");
  if (catalog.format !== "api-contract.catalog.v1") {
    throw new Error("FeatureCatalog.format must be api-contract.catalog.v1");
  }
  assertNonEmptyString(catalog.contractId, "FeatureCatalog.contractId");
  if (!Array.isArray(catalog.features)) {
    throw new Error("FeatureCatalog.features must be an array");
  }

  const seen = new Set<string>();
  const features = catalog.features.map((feature) => normalizeFeatureSpec(feature));
  for (const feature of features) {
    if (seen.has(feature.id)) {
      throw new Error(`Duplicate feature id: ${feature.id}`);
    }
    seen.add(feature.id);
  }

  return {
    ...copyExtensionFields(catalog),
    format: "api-contract.catalog.v1",
    contractId: catalog.contractId,
    ...(catalog.title === undefined ? {} : { title: catalog.title }),
    features: features.sort((a, b) => a.id.localeCompare(b.id))
  };
}

export function catalogFeatureIds(catalog: FeatureCatalog): Set<string> {
  return new Set(catalog.features.map((feature) => feature.id));
}

function normalizeFeatureSpec(feature: FeatureSpec): FeatureSpec {
  assertObject(feature, "FeatureSpec");
  assertNonEmptyString(feature.id, "FeatureSpec.id");
  assertNonEmptyString(feature.title, "FeatureSpec.title");
  if (!releaseTags.has(feature.releaseTag)) {
    throw new Error(`FeatureSpec.releaseTag must be one of public, beta, alpha, internal for ${feature.id}`);
  }
  if (feature.lifecycle !== undefined && !lifecycles.has(feature.lifecycle)) {
    throw new Error(`FeatureSpec.lifecycle must be active, deprecated, or removed for ${feature.id}`);
  }

  return { ...feature };
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
    if (key.startsWith("x-")) {
      out[key as `x-${string}`] = entry;
    }
  }
  return out;
}
