import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { createSurface } from "./surface.js";
import type { FeatureCatalog, UsageLocation, UsageSurface } from "./model.js";

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"]);

export function createUsageSurface(input: {
  packageName: string;
  dependencyName: string;
  contractId: string;
  features: Iterable<string>;
  evidence: UsageSurface["evidence"];
  locations?: UsageSurface["locations"];
}): UsageSurface {
  return {
    packageName: input.packageName,
    dependencyName: input.dependencyName,
    surface: createSurface({ contractId: input.contractId, features: input.features }),
    evidence: input.evidence,
    ...(input.locations === undefined ? {} : { locations: input.locations })
  };
}

export function scanUsageTarget(input: {
  target: string;
  packageName: string;
  dependencyName: string;
  catalog: FeatureCatalog;
}): UsageSurface {
  const featureIds = input.catalog.features.map((feature) => feature.id);
  const usedFeatures = new Set<string>();
  const locations: UsageLocation[] = [];

  for (const file of listSourceFiles(input.target)) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/g);
    for (const [index, line] of lines.entries()) {
      const hasDependency = line.includes(input.dependencyName);
      const lineFeatures = featureIds.filter((feature) => line.includes(feature));
      for (const feature of lineFeatures) usedFeatures.add(feature);
      if (hasDependency || lineFeatures.length > 0) {
        const baseLocation = { file: relative(input.target, file), line: index + 1 };
        const importPath = hasDependency ? { importPath: input.dependencyName } : {};
        if (lineFeatures.length === 0) {
          locations.push({ ...baseLocation, ...importPath });
        } else {
          for (const feature of lineFeatures) {
            locations.push({ ...baseLocation, ...importPath, feature });
          }
        }
      }
    }
  }

  return createUsageSurface({
    packageName: input.packageName,
    dependencyName: input.dependencyName,
    contractId: input.catalog.contractId,
    features: usedFeatures,
    evidence: "source-scan",
    locations
  });
}

function listSourceFiles(target: string): string[] {
  const stat = statSync(target);
  if (stat.isFile()) return sourceExtensions.has(extname(target)) ? [target] : [];
  const out: string[] = [];
  for (const entry of readdirSync(target)) {
    if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
    const full = join(target, entry);
    const entryStat = statSync(full);
    if (entryStat.isDirectory()) out.push(...listSourceFiles(full));
    else if (entryStat.isFile() && sourceExtensions.has(extname(full))) out.push(full);
  }
  return out.sort();
}
