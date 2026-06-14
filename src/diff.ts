import type { ContractDiff, FeatureId, PackageContractManifest } from "./model.js";

export function diffPackageContracts(before: PackageContractManifest, after: PackageContractManifest): ContractDiff {
  const beforeFeatures = featureMap(before);
  const afterFeatures = featureMap(after);
  const addedFeatures: FeatureId[] = [];
  const removedFeatures: FeatureId[] = [];
  const changedFeatures: FeatureId[] = [];
  const deprecatedFeatures: FeatureId[] = [];

  for (const id of afterFeatures.keys()) {
    if (!beforeFeatures.has(id)) addedFeatures.push(id);
  }
  for (const id of beforeFeatures.keys()) {
    if (!afterFeatures.has(id)) removedFeatures.push(id);
  }
  for (const [id, feature] of afterFeatures) {
    const previous = beforeFeatures.get(id);
    if (previous && JSON.stringify(previous) !== JSON.stringify(feature)) changedFeatures.push(id);
    if ((feature as { lifecycle?: string }).lifecycle === "deprecated") deprecatedFeatures.push(id);
  }

  return {
    addedFeatures: addedFeatures.sort(),
    removedFeatures: removedFeatures.sort(),
    changedFeatures: changedFeatures.sort(),
    deprecatedFeatures: deprecatedFeatures.sort()
  };
}

function featureMap(manifest: PackageContractManifest) {
  const out = new Map<string, unknown>();
  for (const catalog of manifest.catalogs ?? []) {
    for (const feature of catalog.features) out.set(feature.id, feature);
  }
  return out;
}
