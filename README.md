# @async/api-contract

`@async/api-contract` makes API compatibility explicit at the feature level. Instead of asking whether two package versions look compatible, a provider publishes the features it supports, a consumer records the features it requires, and CI checks whether the required surface is still a subset of the supported surface.

**30-word value prop:** `@async/api-contract` turns API compatibility into feature-level contracts: publish what packages support, derive what consumers require, and catch breaking changes before versions, docs, or tests drift across Async workspaces during releases.

Compatibility is feature-based, not package-version-based:

```txt
required.features subset_of supported.features
```

Package versions, release tags, docs text, and metadata do not decide compatibility.

## What it produces

- `api-contract.json`: the machine-readable contract a package publishes, including catalogs, supported surfaces, required surfaces, emitted surfaces, or usage evidence.
- `Surface`: normalized runtime data with sorted unique feature ids and a stable hash.
- `API_SURFACE.md`: a deterministic review ledger for maintainers and docs.
- Impact reports: a quick way to see which consumers use removed, changed, or deprecated features before running expensive many-repo checks.

## Quick start

```ts
import {
  compareSurface,
  createSurface,
  defineFeatureCatalog,
  deriveSurface
} from "@async/api-contract";

const catalog = defineFeatureCatalog({
  format: "api-contract.catalog.v1",
  contractId: "@async/user-api.response",
  features: [
    { id: "user.id", title: "User id field", releaseTag: "public", stability: "stable" },
    { id: "user.email", title: "User email field", releaseTag: "public", stability: "stable" }
  ]
});

const userResponse = {
  id: "usr_123",
  email: "ada@example.com"
};

const required = deriveSurface(userResponse, {
  contractId: "@async/user-api.response",
  catalog,
  strictCatalog: true,
  rules: [
    {
      name: "user-response-fields",
      visit(value, context) {
        if (!value || typeof value !== "object" || Array.isArray(value)) return;
        if ("id" in value) context.add("user.id");
        if ("email" in value) context.add("user.email");
      }
    }
  ]
});

const supported = createSurface({
  contractId: "@async/user-api.response",
  features: ["user.id", "user.email"]
});

const result = compareSurface(required, supported);

console.log(required.features); // ["user.email", "user.id"]
console.log(result.ok); // true
```

Host packages own shape validation and derivation rules. For example, `@async/pipeline` should validate branded declaration nodes before deriving a surface from them.

## Policy checks

Subset compatibility is the default. When a catalog is available, comparisons can also enforce release and lifecycle policy:

```ts
const result = compareSurface(required, supported, {
  catalog,
  allowedReleaseTags: ["public"],
  deprecated: "warn",
  removed: "error",
  unknownFeatures: "error"
});

if (!result.ok) {
  console.error(result.warnings);
}
```

## Type-only contracts

Use `@async/api-contract/types` for app code and virtual imports that should express a contract without emitting runtime JavaScript.

```ts
import type {
  AssertCompatible,
  Expect,
  RequiresContract,
  SupportsContract
} from "@async/api-contract/types";

type UsesPipeline = RequiresContract<"@async/pipeline.declaration">;

type UsesShellStep = RequiresContract<
  "@async/pipeline.declaration",
  "task.run" | "step.shell"
>;

type HostSupport = SupportsContract<
  "@async/pipeline.declaration",
  "task.run" | "step.shell" | "agent.stdoutTo"
>;

type Check = Expect<AssertCompatible<UsesShellStep, HostSupport>>;
```

The default is forward-compatible rather than untyped: known fields stay precise, exact feature unions are supported, and option maps allow future `x-*` extension fields.

## Release and stability tags

Catalog features can carry API Extractor-style maturity metadata:

- `public`
- `beta`
- `alpha`
- `internal`

Project-facing stability labels such as `stable`, `preview`, `experimental`, `generated`, `dev-only`, and `internal` are docs and policy metadata. They do not affect `surfaceHash()`.

## CLI

```sh
api-contract check --manifest api-contract.json
api-contract ledger --manifest api-contract.json --out API_SURFACE.md
api-contract ledger --manifest api-contract.json --check API_SURFACE.md
api-contract diff --before old-api-contract.json --after api-contract.json
api-contract impact --before old-api-contract.json --after api-contract.json --consumers consumers.json
api-contract usage scan --target src --package-name @async/consumer --dependency @async/pipeline --catalog api-contract.json --out api-usage.json
```

`impact` is intended as a cheap preflight for explicit many-repo impact runs. Read the latest consumer manifests or usage files first; then run full dependent repo checks only for consumers that actually use changed features.

`usage scan` is a line-oriented source preflight. It records dependency and feature-string evidence, but it is not a full parser or proof of semantic usage.

## Relationship to @async/claims

`@async/claims` can wrap surfaces with issuer, evidence, trust, policy, and signatures. It should not redefine feature ids, hashes, derivation, or compatibility rules.
