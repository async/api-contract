import { createHash } from "node:crypto";
import type { ContractId, FeatureId, SurfaceHash } from "./model.js";

export function normalizeFeatureIds(features: Iterable<FeatureId>): FeatureId[] {
  return [...new Set([...features])].sort((a, b) => a.localeCompare(b));
}

export function surfaceHash(input: { contractId: ContractId; features: Iterable<FeatureId> }): SurfaceHash {
  const payload = JSON.stringify({
    contractId: input.contractId,
    features: normalizeFeatureIds(input.features)
  });
  return `sha256:${createHash("sha256").update(payload).digest("hex")}` as SurfaceHash;
}

export function hashJson(value: unknown): SurfaceHash {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}` as SurfaceHash;
}
