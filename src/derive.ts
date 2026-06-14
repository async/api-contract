import { catalogFeatureIds } from "./catalog.js";
import { createSurface } from "./surface.js";
import type { DeriveContext, DeriveSurfaceOptions, Surface } from "./model.js";

export function deriveSurface(value: unknown, options: DeriveSurfaceOptions): Surface {
  const features = new Set<string>();
  const knownFeatures = options.catalog ? catalogFeatureIds(options.catalog) : undefined;
  const visited = new WeakSet<object>();

  const addFeature = (feature: string): void => {
    if (options.strictCatalog && knownFeatures && !knownFeatures.has(feature)) {
      throw new Error(`Unknown feature emitted by derivation rule: ${feature}`);
    }
    features.add(feature);
  };

  const walk = (node: unknown, path: readonly PropertyKey[]): void => {
    if (isObject(node)) {
      if (visited.has(node)) return;
      visited.add(node);
    }

    const context: DeriveContext = { path, add: addFeature };
    const customChildren: unknown[] = [];
    let hasCustomChildren = false;

    for (const rule of options.rules) {
      rule.visit(node, context);
      if (rule.children) {
        hasCustomChildren = true;
        for (const child of rule.children(node, context)) {
          customChildren.push(child);
        }
      }
    }

    if (hasCustomChildren) {
      for (const [index, child] of customChildren.entries()) {
        walk(child, [...path, index]);
      }
      return;
    }

    for (const [key, child] of defaultChildren(node)) {
      walk(child, [...path, key]);
    }
  };

  walk(value, []);

  return createSurface({ contractId: options.contractId, features });
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

function defaultChildren(value: unknown): Array<[PropertyKey, unknown]> {
  if (!isObject(value)) return [];
  if (Array.isArray(value)) {
    return value.map((entry, index) => [index, entry]);
  }
  if (value instanceof Map) {
    return [...value.entries()].map(([key, entry]) => [String(key), entry]);
  }
  if (value instanceof Set) {
    return [...value.values()].map((entry, index) => [index, entry]);
  }
  return Object.entries(value);
}
