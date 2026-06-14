import type { ContractSet, Surface } from "./model.js";
import { hashJson, normalizeFeatureIds, surfaceHash } from "./hash.js";

export function createSurface(input: {
  contractId: string;
  features: Iterable<string>;
  meta?: Record<string, unknown>;
}): Surface {
  const surface: Surface = {
    format: "api-contract.surface.v1",
    contractId: input.contractId,
    features: normalizeFeatureIds(input.features),
    hash: surfaceHash({ contractId: input.contractId, features: input.features })
  };

  if (input.meta !== undefined) {
    surface.meta = input.meta;
  }

  return surface;
}

export function createContractSet(surfaces: Iterable<Surface>): ContractSet {
  const normalized = [...surfaces]
    .map((surface) => surface.meta === undefined
      ? createSurface({ contractId: surface.contractId, features: surface.features })
      : createSurface({ contractId: surface.contractId, features: surface.features, meta: surface.meta }))
    .sort((a, b) => a.contractId.localeCompare(b.contractId));

  return {
    format: "api-contract.set.v1",
    surfaces: normalized,
    hash: hashJson(normalized.map((surface) => [surface.contractId, surface.hash]))
  };
}
