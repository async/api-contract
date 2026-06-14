# @async/api-contract

`@async/api-contract` tracks semantic API features across Async packages. It is a small generic package for producing machine-readable manifests, runtime surfaces, stable hashes, human API ledgers, type-only contracts, and many-repo impact reports.

Compatibility is feature-based, not package-version-based:

```txt
required.features subset_of supported.features
```

Package versions, release tags, docs text, and metadata do not decide compatibility.

## What it produces

- `api-contract.json`: the machine-readable contract a package publishes.
- `Surface`: normalized runtime data with sorted unique feature ids and a stable hash.
- `API_SURFACE.md`: a deterministic review ledger for maintainers and docs.
- Impact reports: a quick way to see which consumers use removed, changed, or deprecated features before running expensive many-repo checks.

## Runtime example

```ts
import {
  compareSurface,
  createSurface,
  defineFeatureCatalog,
  deriveSurface
} from "@async/api-contract";

const catalog = defineFeatureCatalog({
  format: "api-contract.catalog.v1",
  contractId: "@async/pipeline.declaration",
  features: [
    { id: "task.run", title: "Runnable task", releaseTag: "public", stability: "stable" },
    { id: "step.shell", title: "Shell step", releaseTag: "public", stability: "stable" }
  ]
});

const required = deriveSurface(tree, {
  contractId: "@async/pipeline.declaration",
  catalog,
  strictCatalog: true,
  rules: pipelineRules
});

const supported = createSurface({
  contractId: "@async/pipeline.declaration",
  features: ["task.run", "step.shell"]
});

compareSurface(required, supported);
```

Host packages own shape validation and derivation rules. For example, `@async/pipeline` should validate branded declaration nodes before deriving a surface from them.

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
api-contract usage scan --target src --dependency @async/pipeline --catalog api-contract.json --out api-usage.json
```

`impact` is intended as a cheap preflight for explicit many-repo impact runs. Read the latest consumer manifests or usage files first; then run full dependent repo checks only for consumers that actually use changed features.

## Relationship to @async/claims

`@async/claims` can wrap surfaces with issuer, evidence, trust, policy, and signatures. It should not redefine feature ids, hashes, derivation, or compatibility rules.
