import { diffPackageContracts } from "./diff.js";
import type { ImpactReport, PackageContractManifest, UsageSurface } from "./model.js";

export function createImpactReport(input: {
  before: PackageContractManifest;
  after: PackageContractManifest;
  consumers: readonly PackageContractManifest[];
}): ImpactReport {
  const diff = diffPackageContracts(input.before, input.after);
  const relevant = new Set([...diff.removedFeatures, ...diff.changedFeatures, ...diff.deprecatedFeatures]);
  const impactedConsumers: UsageSurface[] = [];
  const unaffectedConsumers: UsageSurface[] = [];

  for (const consumer of input.consumers) {
    for (const usage of consumer.usage ?? []) {
      const impacted = usage.surface.features.some((feature) => relevant.has(feature));
      if (impacted) impactedConsumers.push(usage);
      else unaffectedConsumers.push(usage);
    }
  }

  return {
    ok: impactedConsumers.length === 0,
    providerPackage: input.after.packageName,
    removedFeatures: diff.removedFeatures,
    changedFeatures: [...new Set([...diff.changedFeatures, ...diff.deprecatedFeatures])].sort(),
    impactedConsumers,
    unaffectedConsumers
  };
}
