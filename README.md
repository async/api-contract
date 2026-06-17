# @async/api-contract

`@async/api-contract` lets a package publish one API source that can drive
programmatic handlers, generated CLIs, generated local dashboards, compatibility
ledgers, and impact reports.

The package still treats compatibility as feature-based:

```txt
required.features subset_of supported.features
```

Package versions, release tags, docs text, README prose, and dashboard layout
hints do not decide compatibility unless the package maps them to explicit
contract-bearing features.

## What This Solves

Local developer tools often grow the same behavior in several places:

- a programmatic API for tests and library users;
- a CLI for humans;
- a JSON command surface for automation;
- a dashboard for local inspection;
- docs that explain the workflow;
- compatibility ledgers that show what changed.

When those surfaces are maintained separately, they drift. `@async/api-contract`
keeps the core behavior behind programmatic handlers and makes CLI and dashboard
surfaces projections of the same operation contract.

## Core Idea

Define operations once:

- operation id, title, lifecycle, and feature id;
- input and output schemas;
- local side effects;
- stable errors;
- receipt and report paths;
- docs references;
- CLI hints;
- dashboard hints.

Then generate the review and adapter material:

- `api-contract.json`;
- `API_SURFACE.md`;
- CLI descriptors;
- dashboard manifests;
- TypeScript-friendly handler bindings.

The generated CLI and dashboard stay thin. They parse input, call the bound
operation, format the result, and surface receipts. They do not own business
logic.

## When To Use It

Use `@async/api-contract` when a package needs a stable API surface across more
than one consumer.

Good fits:

- local-first developer tools;
- project generators;
- migration tools;
- fleet or multi-repo maintenance tools;
- verification tools;
- packages with both programmatic and CLI APIs;
- tools with a local dashboard that should call a machine-stable CLI.

Do not use it as a replacement for host-specific validation. Host packages
still own their domain rules, filesystem checks, permissions, and execution
policy.

## Concepts

### Feature surfaces

A `Surface` is normalized runtime data with sorted unique feature ids and a
stable hash. Compatibility is checked by comparing required features with
supported features.

### Operations

An operation is a callable unit such as `project.init`, `project.verify`, or
`project.report`. Operations can derive compatibility features like
`operation.project.init`, so removing a callable capability appears in normal
diff and impact workflows.

### Schemas

Schemas describe operation input and output. `@async/api-contract` uses a small
schema adapter interface instead of forcing one validator. JSON Schema, Zod,
Valibot, TypeBox, or a custom parser can all feed the same contract as long as
they expose parse and JSON-schema output.

### Projections

Projections describe generated surfaces. A CLI projection names command paths,
flags, positional arguments, and interactive prompts. A dashboard projection
names form, table, detail, or summary views. Projections do not execute domain
logic.

### Handlers

Handlers are implementation functions bound to operation ids. A handler is the
programmatic source of behavior. Tests, generated clients, CLI commands, and
dashboard transports all invoke handlers through the same operation id.

### Effects

Effects document what an operation may do: read files, write files, spawn
processes, make network requests, run an agent, verify browser output, write to
Git, or install packages. Effects make local side effects visible before a CLI
or dashboard runs an operation.

### Receipts

Receipts describe durable evidence written by operations, such as reports,
transcripts, verification logs, or JSON receipts. They make non-trivial local
work auditable instead of only printing terminal output.

### Docs

Docs references attach bounded source material to operations: README sections,
spec paths, URLs, short summaries, and optional hashes. Full markdown embedding
should be opt-in and size-limited.

### Compatibility hashes

Feature ids decide compatibility hashes. Labels, README summaries, CLI prompt
text, and dashboard layout hints stay outside compatibility unless the package
deliberately publishes feature ids for them.

## Tooling Overview

### `defineApiContract()`

Defines the maintained API source for a package: package name, operation list,
docs, and contract id.

You want this because every generated surface needs the same source of truth.

### `defineOperation()`

Normalizes one callable operation with schemas, lifecycle, effects, errors,
receipts, CLI metadata, and dashboard metadata.

You want this because a package can review one operation object instead of
comparing disconnected CLI code, dashboard forms, and docs.

### `defineJsonSchema()`

Wraps JSON Schema with optional parsing, defaults, examples, and descriptions.

You want this because generated CLI prompts and dashboard forms need portable
schema data, while programmatic invocation still needs runtime parsing.

### `bindApiHandlers()`

Connects operation metadata to implementation functions.

You want this because CLI and dashboard code can stay thin. They call operation
handlers instead of reimplementing workflow logic.

### `invokeOperation()`

Invokes one bound operation by id, parses input, runs the handler, and parses
output.

You want this because tests, generated clients, machine CLI commands, and local
dashboards need one invocation path.

### `createOperationSurface()`

Converts operations into a normal compatibility `Surface`.

You want this because removed or renamed operations should appear in existing
feature diff and impact reports.

### `generatePackageManifest()`

Emits `api-contract.json` with existing catalogs and surfaces plus an
`x-interface` operation section.

You want this because current `api-contract.package.v1` users keep working
while richer interface metadata becomes available to generators.

### `renderApiSurfaceMarkdown()`

Renders `API_SURFACE.md` from a manifest, including feature catalogs, surfaces,
and operation metadata when `x-interface` is present.

You want this because maintainers need a deterministic human ledger for review.

### `generateCliDescriptor()`

Produces a CLI descriptor with human command paths and machine-stable JSON
commands.

You want this because humans and dashboards need different CLI surfaces:

```sh
workspace-tool project init
workspace-tool api manifest --json
workspace-tool api describe project.init --json
workspace-tool api invoke project.init --input-json '{"name":"Acme Console"}'
```

The dashboard should call the machine API commands. It should not scrape human
interactive prompt output.

### `generateDashboardManifest()`

Produces local dashboard metadata: operation groups, forms, result views,
schemas, effects, and the CLI transport command for each operation.

You want this because a local dashboard can be generated from the same contract
without becoming the source of truth for project state.

### `renderInterfaceMarkdown()`

Renders a compact operation-focused markdown document.

You want this when a package needs interface documentation without the full
feature ledger.

## Quick Start

```sh
pnpm add @async/api-contract
```

```ts
import {
  bindApiHandlers,
  defineApiContract,
  defineJsonSchema,
  generateCliDescriptor,
  generateDashboardManifest,
  generatePackageManifest,
  invokeOperation
} from "@async/api-contract";

const initInput = defineJsonSchema<{ name: string; directory?: string }>({
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string" },
    directory: { type: "string", default: "." }
  }
}, {
  parse(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("input must be an object");
    }
    const input = value as { name?: unknown; directory?: unknown };
    if (typeof input.name !== "string") throw new Error("name must be a string");
    return {
      name: input.name,
      directory: typeof input.directory === "string" ? input.directory : "."
    };
  },
  defaults: () => ({ directory: "." }),
  examples: () => [{ name: "Acme Console", directory: "./acme-console" }]
});

const resultSchema = defineJsonSchema<{ ok: boolean; reportPath: string }>({
  type: "object",
  required: ["ok", "reportPath"],
  properties: {
    ok: { type: "boolean" },
    reportPath: { type: "string" }
  }
});

const contract = defineApiContract({
  packageName: "@acme/workspace-tool",
  title: "Workspace Tool",
  docs: [{
    id: "readme",
    path: "README.md",
    summary: "Explains workspace operations and generated surfaces."
  }],
  operations: {
    "project.init": {
      title: "Initialize project",
      description: "Create a local project workspace.",
      input: initInput,
      output: resultSchema,
      effects: ["filesystem.write"],
      docs: ["readme"],
      receipts: [{ kind: "report", pathTemplate: "reports/init-{timestamp}.md" }],
      cli: { command: "project init", interactive: true },
      dashboard: { group: "Project", view: "form", resultView: "summary" }
    },
    "project.verify": {
      title: "Verify project",
      description: "Check the local project and write a report.",
      output: resultSchema,
      effects: ["filesystem.read"],
      cli: { command: "project verify" },
      dashboard: { group: "Project", view: "summary", resultView: "log" }
    }
  }
});

const api = bindApiHandlers(contract, {
  "project.init": async (input) => ({
    ok: true,
    reportPath: `${input.directory}/reports/init.md`
  }),
  "project.verify": async () => ({
    ok: true,
    reportPath: "reports/verify.md"
  })
});

const result = await invokeOperation(api, "project.init", {
  name: "Acme Console"
});

console.log(result.reportPath);
console.log(generatePackageManifest(contract));
console.log(generateCliDescriptor(contract, { binaryName: "workspace-tool" }));
console.log(generateDashboardManifest(contract, { binaryName: "workspace-tool" }));
```

## Generated CLI

A generated CLI should have two layers.

Human commands are optimized for developers:

```sh
workspace-tool project init
workspace-tool project verify
workspace-tool project report
```

Machine commands are optimized for tools:

```sh
workspace-tool api manifest --json
workspace-tool api operations --json
workspace-tool api describe project.init --json
workspace-tool api invoke project.init --input-json '{"name":"Acme Console"}'
```

The machine layer is the local transport for dashboards and automation. It must
return stable JSON and should not depend on prompt text, terminal colors, or
interactive formatting.

## Generated Dashboard

`generateDashboardManifest()` produces a manifest a local dashboard can render:

- operation groups;
- form, summary, table, detail, or log views;
- input and output schemas;
- local effects;
- CLI transport commands.

The dashboard should inspect local state and invoke the machine CLI. It should
not become the durable state authority, and it should not contain domain
business logic.

## Compatibility Workflow

Operation contracts feed the existing feature workflow:

```ts
import {
  createOperationSurface,
  diffPackageContracts,
  generatePackageManifest
} from "@async/api-contract";
```

If `project.verify` is removed, `operation.project.verify` disappears from the
operation surface. Existing `api-contract diff` and impact reports can flag that
as a capability change.

```sh
api-contract check --manifest api-contract.json
api-contract ledger --manifest api-contract.json --out API_SURFACE.md
api-contract ledger --manifest api-contract.json --check API_SURFACE.md
api-contract diff --before old-api-contract.json --after api-contract.json
api-contract impact --before old-api-contract.json --after api-contract.json --consumers consumers.json
api-contract usage scan --target src --package-name @async/consumer --dependency @async/pipeline --catalog api-contract.json --out api-usage.json
```

`impact` is intended as a cheap preflight for explicit many-repo impact runs.
Read the latest consumer manifests or usage files first; then run full dependent
repo checks only for consumers that actually use changed features.

`usage scan` is a line-oriented source preflight. It records dependency and
feature-string evidence, but it is not a full parser or proof of semantic usage.

## Type-Only Contracts

Use `@async/api-contract/types` for app code and virtual imports that should
express a contract without emitting runtime JavaScript.

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

Use `@async/api-contract/interface` for operation-specific types and helpers.

## Release And Stability Tags

Catalog features can carry API Extractor-style maturity metadata:

- `public`
- `beta`
- `alpha`
- `internal`

Project-facing stability labels such as `stable`, `preview`, `experimental`,
`generated`, `dev-only`, and `internal` are docs and policy metadata. They do
not affect `surfaceHash()`.

## Design Rules

- Keep business logic in programmatic handlers.
- Treat CLI and dashboard as projections.
- Let dashboards call machine-stable CLI JSON commands, not human prompt text.
- Keep README prose and dashboard layout hints out of compatibility hashes
  unless they are explicitly mapped to feature ids.
- Use bounded docs references instead of embedding unbounded markdown by
  default.
- Keep host-specific validation in the host package.
- Preserve the existing `api-contract.package.v1` manifest format; put richer
  interface metadata under `x-interface`.

## Maintainer Workflow

The repository's package scripts and GitHub Actions are generated from
`pipeline.ts` through `@async/pipeline`.

```sh
pnpm run pipeline:verify
pnpm run pipeline:api-surface
pnpm run pipeline:api-surface:generate
pnpm run pipeline:github:check
pnpm run pipeline:sync:check
pnpm run release:check
```

Release and preview lifecycle commands are also synced from `pipeline.ts`:

```sh
pnpm run pipeline:preview
pnpm run pipeline:snapshot
pnpm run pipeline:publish
pnpm run pipeline:release:doctor
```

## Relationship To @async/claims

`@async/claims` can wrap surfaces with issuer, evidence, trust, policy, and
signatures. It should not redefine feature ids, hashes, derivation, or
compatibility rules.
