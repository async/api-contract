export type ContractId = string;
export type FeatureId = string;
export type SurfaceHash = `sha256:${string}`;

export type ReleaseTag = "public" | "beta" | "alpha" | "internal";

export type KnownStabilityLabel =
  | "stable"
  | "preview"
  | "experimental"
  | "generated"
  | "dev-only"
  | "internal";

export type StabilityLabel = KnownStabilityLabel | (string & {});
export type FeatureLifecycle = "active" | "deprecated" | "removed";

export type ExtensionFields = {
  readonly [key: `x-${string}`]: unknown;
};

export interface FeatureSpec extends ExtensionFields {
  id: FeatureId;
  title: string;
  releaseTag: ReleaseTag;
  stability?: StabilityLabel;
  lifecycle?: FeatureLifecycle;
  description?: string;
  docsUrl?: string;
  since?: string;
  deprecatedSince?: string;
  removedSince?: string;
  replacedBy?: FeatureId;
  group?: string;
}

export interface FeatureCatalog extends ExtensionFields {
  format: "api-contract.catalog.v1";
  contractId: ContractId;
  title?: string;
  features: readonly FeatureSpec[];
}

export interface Surface extends ExtensionFields {
  format: "api-contract.surface.v1";
  contractId: ContractId;
  features: readonly FeatureId[];
  hash: SurfaceHash;
  meta?: Record<string, unknown>;
}

export interface ContractSet extends ExtensionFields {
  format: "api-contract.set.v1";
  surfaces: readonly Surface[];
  hash: SurfaceHash;
}

export interface PackageContractManifest extends ExtensionFields {
  format: "api-contract.package.v1";
  packageName: string;
  catalogs?: readonly FeatureCatalog[];
  supported?: readonly Surface[];
  required?: readonly Surface[];
  emits?: readonly Surface[];
  usage?: readonly UsageSurface[];
}

export interface ComparePolicy extends ExtensionFields {
  catalog?: FeatureCatalog;
  catalogs?: readonly FeatureCatalog[];
  allowedReleaseTags?: readonly ReleaseTag[];
  deprecated?: "allow" | "warn" | "error";
  removed?: "allow" | "warn" | "error";
  unknownFeatures?: "allow" | "warn" | "error";
}

export interface SurfaceComparison {
  ok: boolean;
  missing: readonly FeatureId[];
  unsupported: readonly FeatureId[];
  warnings: readonly string[];
}

export interface DeriveRule {
  name: string;
  visit(value: unknown, context: DeriveContext): void;
  children?(value: unknown, context: DeriveContext): Iterable<unknown>;
}

export interface DeriveContext {
  path: readonly PropertyKey[];
  add(feature: FeatureId): void;
}

export interface DeriveSurfaceOptions {
  contractId: ContractId;
  rules: readonly DeriveRule[];
  catalog?: FeatureCatalog;
  strictCatalog?: boolean;
}

export interface UsageLocation {
  file: string;
  line?: number;
  importPath?: string;
  symbol?: string;
  feature?: FeatureId;
}

export interface UsageSurface {
  packageName: string;
  dependencyName: string;
  surface: Surface;
  evidence: "published-manifest" | "type-contract" | "runtime-derived" | "source-scan";
  locations?: readonly UsageLocation[];
}

export interface ImpactReport {
  ok: boolean;
  providerPackage: string;
  removedFeatures: readonly FeatureId[];
  changedFeatures: readonly FeatureId[];
  impactedConsumers: readonly UsageSurface[];
  unaffectedConsumers: readonly UsageSurface[];
}

export interface ContractDiff {
  addedFeatures: readonly FeatureId[];
  removedFeatures: readonly FeatureId[];
  changedFeatures: readonly FeatureId[];
  deprecatedFeatures: readonly FeatureId[];
}

export interface LedgerConfig extends ExtensionFields {
  title?: string;
  reviewRule?: string;
  sections?: readonly LedgerSection[];
}

export interface LedgerSection extends ExtensionFields {
  id: string;
  title: string;
  type:
    | "features"
    | "surfaces"
    | "package-exports"
    | "cli"
    | "runtime"
    | "operations"
    | "http"
    | "generated"
    | "config"
    | "internal-boundaries";
  groups?: readonly string[];
}

export interface RenderLedgerInput {
  manifest: PackageContractManifest;
  title?: string;
  reviewRule?: string;
}
