import type { ComparePolicy, ContractSet, FeatureCatalog, FeatureId, FeatureSpec, Surface, SurfaceComparison } from "./model.js";

type PolicyAction = "allow" | "warn" | "error";

export function compareSurface(required: Surface, supported: Surface, policy: ComparePolicy = {}): SurfaceComparison {
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
  const policyResult = evaluatePolicy(required, policy);

  return {
    ok: missing.length === 0 && policyResult.ok,
    missing,
    unsupported,
    warnings: policyResult.warnings
  };
}

export function compareContractSets(required: ContractSet, supported: ContractSet, policy: ComparePolicy = {}): SurfaceComparison {
  const supportedByContract = new Map(supported.surfaces.map((surface) => [surface.contractId, surface]));
  const missing: FeatureId[] = [];
  const unsupported: FeatureId[] = [];
  const warnings: string[] = [];
  let ok = true;

  for (const requiredSurface of required.surfaces) {
    const supportedSurface = supportedByContract.get(requiredSurface.contractId);
    if (!supportedSurface) {
      ok = false;
      missing.push(...requiredSurface.features.map((feature) => `${requiredSurface.contractId}:${feature}`));
      warnings.push(`Missing supported surface for ${requiredSurface.contractId}`);
      continue;
    }
    const comparison = compareSurface(requiredSurface, supportedSurface, policy);
    if (!comparison.ok) ok = false;
    missing.push(...comparison.missing);
    unsupported.push(...comparison.unsupported);
    warnings.push(...comparison.warnings);
  }

  return {
    ok: ok && missing.length === 0,
    missing,
    unsupported,
    warnings
  };
}

function evaluatePolicy(required: Surface, policy: ComparePolicy): { ok: boolean; warnings: string[] } {
  const features = policyFeatureMap(required.contractId, policy);
  if (!features) return { ok: true, warnings: [] };

  const warnings: string[] = [];
  const errors: string[] = [];

  const report = (action: PolicyAction | undefined, message: string): void => {
    if (action === "warn") warnings.push(message);
    if (action === "error") errors.push(message);
  };

  for (const featureId of required.features) {
    const feature = features.get(featureId);
    if (!feature) {
      report(policy.unknownFeatures, `Unknown feature in ${required.contractId}: ${featureId}`);
      continue;
    }

    if (policy.allowedReleaseTags && !policy.allowedReleaseTags.includes(feature.releaseTag)) {
      errors.push(`Feature ${featureId} has release tag ${feature.releaseTag}, which is not allowed by policy`);
    }

    if (feature.lifecycle === "deprecated") {
      report(policy.deprecated, `Feature ${featureId} is deprecated`);
    }

    if (feature.lifecycle === "removed") {
      report(policy.removed, `Feature ${featureId} is removed`);
    }
  }

  return {
    ok: errors.length === 0,
    warnings: [...warnings, ...errors.map((error) => `Policy error: ${error}`)]
  };
}

function policyFeatureMap(contractId: string, policy: ComparePolicy): Map<string, FeatureSpec> | undefined {
  const catalogs = policyCatalogs(policy).filter((catalog) => catalog.contractId === contractId);
  if (catalogs.length === 0) return undefined;

  const features = new Map<string, FeatureSpec>();
  for (const catalog of catalogs) {
    for (const feature of catalog.features) {
      features.set(feature.id, feature);
    }
  }
  return features;
}

function policyCatalogs(policy: ComparePolicy): FeatureCatalog[] {
  return [
    ...(policy.catalog ? [policy.catalog] : []),
    ...(policy.catalogs ?? [])
  ];
}
