import type { ComparePolicy, ContractSet, FeatureId, Surface, SurfaceComparison } from "./model.js";

export function compareSurface(required: Surface, supported: Surface, _policy: ComparePolicy = {}): SurfaceComparison {
  if (required.contractId !== supported.contractId) {
    return {
      ok: false,
      missing: [...required.features],
      unsupported: [...supported.features],
      warnings: [`Contract id mismatch: required ${required.contractId}, supported ${supported.contractId}`]
    };
  }

  const supportedFeatures = new Set(supported.features);
  const requiredFeatures = new Set(required.features);
  const missing = required.features.filter((feature) => !supportedFeatures.has(feature));
  const unsupported = supported.features.filter((feature) => !requiredFeatures.has(feature));

  return {
    ok: missing.length === 0,
    missing,
    unsupported,
    warnings: []
  };
}

export function compareContractSets(required: ContractSet, supported: ContractSet, policy: ComparePolicy = {}): SurfaceComparison {
  const supportedByContract = new Map(supported.surfaces.map((surface) => [surface.contractId, surface]));
  const missing: FeatureId[] = [];
  const unsupported: FeatureId[] = [];
  const warnings: string[] = [];

  for (const requiredSurface of required.surfaces) {
    const supportedSurface = supportedByContract.get(requiredSurface.contractId);
    if (!supportedSurface) {
      missing.push(...requiredSurface.features.map((feature) => `${requiredSurface.contractId}:${feature}`));
      warnings.push(`Missing supported surface for ${requiredSurface.contractId}`);
      continue;
    }
    const comparison = compareSurface(requiredSurface, supportedSurface, policy);
    missing.push(...comparison.missing);
    unsupported.push(...comparison.unsupported);
    warnings.push(...comparison.warnings);
  }

  return {
    ok: missing.length === 0,
    missing,
    unsupported,
    warnings
  };
}
