# @async/api-contract

`@async/api-contract` is the metadata contract layer for packages and local
tools. It lets maintainers describe multiple API concerns from one source, then
emit stable artifacts for compatibility review, programmatic invocation, CLIs,
local dashboards, MCP tools, evidence, and generated clients.

The package still treats compatibility as feature-based:

```txt
required.features subset_of supported.features
```

Package versions, release tags, docs text, README prose, prompt copy, and
dashboard layout hints do not decide compatibility unless a package maps them
to explicit contract-bearing feature ids.

## What This Solves

Local developer tools often grow the same behavior in several places:

- a programmatic API for tests and library users;
- a CLI for humans;
- a machine JSON command surface for automation and local dashboards;
- an MCP server for agent/tool clients;
- schema metadata for validation, prompts, and forms;
- docs that explain the workflow;
- reports and receipts that prove what happened;
- compatibility ledgers that show what changed.

When those surfaces are maintained separately, they drift.
`@async/api-contract` keeps behavior behind programmatic handlers and makes CLI,
dashboard, schema, and docs surfaces projections of one metadata source.
MCP tools follow the same rule: they are adapters over operations, not a second
place to implement behavior.

## Core Idea

Describe the API once:

- feature catalogs and compatibility surfaces;
- schema metadata;
- callable operations;
- CLI projections;
- dashboard projections;
- MCP projections;
- effects, receipts, reports, and transcripts;
- docs references.

Then generate review and adapter artifacts:

- `api-contract.json`;
- `API_SURFACE.md`;
- CLI descriptors;
- dashboard manifests;
- MCP descriptors;
- MCP stdio server module source;
- typed client source;
- machine CLI router descriptors.

Generators emit descriptors, routers, manifests, and docs. They do not execute
business logic.

## Choose Your Goal

### Compatibility

Use feature catalogs and surfaces when the goal is to publish what a package
supports, requires, emits, or consumes.

Use it when:

- you need release-review ledgers;
- consumers need impact checks;
- capability compatibility should not depend on package versions.

It emits:

- normalized surfaces;
- stable surface hashes;
- `API_SURFACE.md`;
- diff and impact reports.

It deliberately does not own:

- host-specific validation;
- release policy;
- runtime behavior.

### Schema Metadata

Use schema metadata when the goal is to describe input/output shapes for
validation, prompts, forms, tables, or metadata inspection.

Use it when:

- a CLI needs prompt choices or validation;
- a dashboard needs a form or table;
- a package wants to publish shape metadata without choosing one schema library.

It emits:

- JSON Schema output;
- defaults;
- examples;
- field help text;
- UI-safe widget hints;
- prompt-safe input hints;
- optional schema feature ids.

It deliberately does not own:

- storage engines;
- host-specific domain rules;
- one required validator library.

### Programmatic Interface

Use operation contracts when the goal is to expose callable API behavior.

Use it when:

- tests, CLIs, dashboards, and generated clients should call one handler path;
- removing an operation should appear in compatibility diffs;
- local side effects need to be visible before execution.

It emits:

- operation metadata;
- operation-derived feature surfaces;
- handler bindings;
- standard invocation helpers.

It deliberately does not own:

- business logic;
- permissions enforcement;
- process or filesystem policy.

### Generated CLI

Use CLI projections when the goal is to generate human commands and machine JSON
endpoints from operation or schema metadata.

Use it when:

- humans need ergonomic commands;
- dashboards and automation need stable JSON commands;
- interactive prompts should be metadata-driven.

It emits:

- command paths;
- args and flags;
- prompt metadata;
- output mode metadata;
- machine JSON command mapping;
- exit-code metadata.

It deliberately does not own:

- operation handlers;
- terminal scraping;
- dashboard state.

### Generated Dashboard

Use dashboard projections when the goal is to generate a local inspection UI
from the same metadata.

Use it when:

- a local dashboard needs forms, tables, details, summaries, or logs;
- the dashboard should call a machine CLI instead of duplicating behavior;
- users need to inspect receipts and reports.

It emits:

- operation groups;
- form/table/detail view metadata;
- result summaries;
- empty states;
- local transport config.

It deliberately does not own:

- durable state authority;
- business logic;
- long-lived service state.

### Generated MCP

Use MCP projections when the goal is to expose selected operations as MCP tools.

Use it when:

- agent clients should discover and call tool operations;
- MCP exposure needs to be explicit and reviewable;
- maintainers want generated `registerTool()` boilerplate without adding an MCP
  runtime dependency to this package.

It emits:

- MCP tool descriptors;
- tool names, titles, descriptions, annotations, schemas, effects, and receipts;
- TypeScript stdio server module source.

It deliberately does not own:

- business logic;
- the MCP runtime dependency;
- MCP resources, prompts, Streamable HTTP, auth, or subscriptions.

### Evidence And Receipts

Use effects and receipts when the goal is to make local work auditable.

Use it when:

- operations write files;
- operations spawn processes;
- tools produce reports, transcripts, or verification logs;
- users need durable evidence beyond terminal output.

It emits:

- effect lists;
- receipt path templates;
- report/transcript/verification metadata.

It deliberately does not own:

- secret handling;
- transcript storage policy;
- verification semantics for a host package.

## Concepts

### Feature Surfaces

A `Surface` is normalized runtime data with sorted unique feature ids and a
stable hash. Compatibility is checked by comparing required features with
supported features.

### Schema Metadata

A schema is a portable description of shape plus optional generation hints.
Schemas can provide JSON Schema, defaults, examples, enum labels, field help
text, prompt hints, and widget hints.

### Operations

An operation is a callable unit such as `project.init`, `project.verify`, or
`project.report`. Operations can derive compatibility features such as
`operation.project.init`, so removed callable capabilities appear in normal diff
and impact workflows.

### Projections

Projections describe user-facing surfaces. A CLI projection names command paths,
flags, positional arguments, prompts, output modes, and machine JSON mapping. A
dashboard projection names form, table, detail, summary, or log views. An MCP
projection names which operations become MCP tools and how those tools should be
described.

### Handlers

Handlers are implementation functions bound to operation ids. A handler is the
programmatic source of behavior. Tests, generated clients, CLI commands,
dashboard transports, and generated MCP tools all invoke handlers through the
same operation id.

### Effects

Effects document what an operation may do: read files, write files, spawn
processes, make network requests, run agent-style workers, verify browser
output, write to Git, or install packages.

### Receipts

Receipts describe durable evidence written by operations, such as reports,
transcripts, verification logs, or JSON receipts.

### Docs

Docs references attach bounded source material to operations: README sections,
spec paths, URLs, short summaries, and optional hashes. Full markdown embedding
should be opt-in and size-limited.

### Compatibility Hashes

Feature ids decide compatibility hashes. Labels, README summaries, CLI prompt
text, and dashboard layout hints stay outside compatibility unless the package
deliberately publishes feature ids for them.

## Quick Start

```sh
pnpm add @async/api-contract
```

```ts
import { defineApiContract, defineOperation } from "@async/api-contract/interface";
import { jsonSchemaAdapter } from "@async/api-contract/schema";
import {
  generateCliDescriptor,
  generateDashboardManifest,
  generateMcpDescriptor
} from "@async/api-contract/generators";

const projectInitInput = jsonSchemaAdapter<{ name: string }>({
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string" }
  }
}, {
  parse(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("input must be an object");
    }
    const input = value as { name?: unknown };
    if (typeof input.name !== "string") throw new Error("name must be a string");
    return { name: input.name };
  }
});

const projectInitOutput = jsonSchemaAdapter<{ ok: boolean }>({
  type: "object",
  required: ["ok"],
  properties: {
    ok: { type: "boolean" }
  }
});

const contract = defineApiContract({
  packageName: "workspace-tool",
  operations: [
    defineOperation({
      id: "project.init",
      title: "Initialize project",
      input: projectInitInput,
      output: projectInitOutput,
      effects: ["filesystem.write"],
      cli: {
        command: "init",
        interactive: true
      },
      dashboard: {
        group: "Project",
        view: "form",
        resultView: "summary",
        transport: "machine-cli"
      },
      mcp: {
        toolName: "project.init",
        title: "Initialize project",
        resultContent: "json-text"
      }
    })
  ]
});

console.log(generateCliDescriptor(contract, { binaryName: "workspace-tool" }));
console.log(generateDashboardManifest(contract, { binaryName: "workspace-tool" }));
console.log(generateMcpDescriptor(contract, { serverName: "workspace-tool" }));
```

## Generating From Metadata

`@async/api-contract` can generate user-facing surfaces from either:

- a programmatic API contract;
- schema metadata;
- both together.

### Generating A CLI

A CLI can be generated from operation metadata:

```ts
const contract = defineApiContract({
  packageName: "workspace-tool",
  operations: [
    defineOperation({
      id: "project.init",
      title: "Initialize project",
      input: projectInitInput,
      output: projectInitOutput,
      effects: ["filesystem.write"],
      cli: {
        command: "init",
        interactive: true
      }
    })
  ]
});
```

Generated human CLI:

```sh
workspace-tool init
```

Generated machine CLI:

```sh
workspace-tool api manifest --json
workspace-tool api describe project.init --json
workspace-tool api invoke project.init --input-json '{"name":"Acme"}'
```

Rule: dashboards and automation call the machine JSON API, not interactive
prompt output.

A CLI can also be generated from schema metadata alone for tools that only need
validation, inspection, or form-like commands.

### Generating A Dashboard

A dashboard can be generated from the same metadata:

```ts
dashboard: {
  group: "Project",
  view: "form",
  resultView: "summary",
  transport: "machine-cli"
}
```

The generated dashboard manifest describes:

- available operations;
- input forms;
- result views;
- table/detail views;
- local invoke command;
- receipt and report locations.

Dashboard rule: the dashboard is a projection. It must not become the durable
state authority.

### Generating MCP Servers

MCP can be generated from the same operation metadata. In v1, MCP support is
limited to tools over stdio.

```ts
import { generateMcpDescriptor, generateMcpServerModule } from "@async/api-contract/generators";

const contract = defineApiContract({
  packageName: "workspace-tool",
  operations: [
    defineOperation({
      id: "project.init",
      title: "Initialize project",
      input: projectInitInput,
      output: projectInitOutput,
      effects: ["filesystem.write"],
      receipts: [{ kind: "report", pathTemplate: "reports/init-{timestamp}.md" }],
      mcp: {
        toolName: "project.init",
        title: "Initialize project",
        description: "Create a local project workspace.",
        annotations: { destructiveHint: true },
        resultContent: "json-text",
        featureId: "mcp.project.init"
      }
    })
  ]
});

const descriptor = generateMcpDescriptor(contract, {
  serverName: "workspace-tool",
  serverVersion: "1.0.0"
});

const serverSource = generateMcpServerModule(contract, {
  serverName: "workspace-tool",
  serverVersion: "1.0.0"
});
```

The descriptor has `format: "api-contract.mcp.v1"` and includes package name,
server name, protocol target, tools, schemas, effects, receipts, and feature
ids. It is review data; it does not import or execute the MCP SDK.

The generated server module is TypeScript source text. It imports
`invokeOperation()` from `@async/api-contract`, imports `McpServer` and
`StdioServerTransport` from the consuming project's MCP SDK install, registers
tools, exports `createMcpServer(api)` and `main(api)`, and calls
`invokeOperation(api, operationId, args)`.

MCP exposure is explicit by default:

```ts
generateMcpDescriptor(contract); // only operations with mcp metadata
generateMcpDescriptor(contract, { exposure: "all" }); // every operation except disabled MCP projections
```

Use explicit exposure for local-first tools because MCP tools are model-visible
actions. Operation ids can become tool names only when they already match MCP
tool-name guidance. If an operation id contains spaces or other unsafe
characters, set `mcp.toolName`.

Consumer packages install the official MCP TypeScript SDK only when they need
to run the generated server module. `@async/api-contract` does not depend on an
MCP runtime package.

### From Schema Metadata

Schema-only dashboards or CLIs are valid.

Examples:

- render a form from JSON Schema;
- render a table from output schema;
- generate prompt choices from enums;
- generate validation commands;
- generate metadata inspection views.

This is useful for later host packages, but the core concept stays generic.

### From Programmatic API

Operation-first tools define handlers and invoke them:

```ts
import { bindApiHandlers } from "@async/api-contract/interface";

const api = bindApiHandlers(contract, {
  "project.init": async (input, context) => {
    return createProject(input, context);
  }
});
```

Generated CLI and dashboard surfaces both route through the same operation
handler.

Generated MCP tools route through that same handler path. They should not embed
handler implementation logic in generated source.

## Tooling Overview

### `defineFeatureCatalog()`

Declares compatibility features for an API concern.

Use it when you want a reviewed feature inventory with release and lifecycle
metadata.

It emits a normalized feature catalog. It does not execute or validate runtime
behavior.

### `createSurface()`

Creates a normalized feature surface with a stable hash.

Use it when you need supported, required, emitted, or consumed feature lists.

It emits sorted feature ids and a hash. It does not decide release policy.

### `defineSchema()`

Defines generic schema metadata.

Use it when a shape should be reusable across validation, prompts, forms, and
compatibility features.

It emits schema metadata. It does not enforce host-specific domain rules.

### `jsonSchemaAdapter()`

Wraps JSON Schema with optional parsing, defaults, examples, and descriptions.

Use it when generators need portable schema data and invocation still needs
runtime parsing.

It emits a schema adapter. It does not require a validation library.

### `standardSchemaAdapter()`

Wraps a Standard Schema-style validator.

Use it when a package already exposes a Standard Schema-compatible object.

It emits a schema adapter. The current helper only supports synchronous parsing.

### `createSchemaFeature()`

Maps schema metadata to a compatibility feature.

Use it when changing or removing a schema should be visible in diff and impact
workflows.

It emits a `FeatureSpec`. It does not automatically decide whether a schema is
contract-bearing.

### `defineApiContract()`

Defines the maintained operation source for a package.

Use it when operations, schemas, docs, and projections should serialize into
one interface manifest.

It emits an `api-contract.interface.v1` structure. It does not bind handlers.

### `defineOperation()`

Normalizes one callable operation with schemas, lifecycle, effects, errors,
receipts, CLI metadata, and dashboard metadata.

Use it when a callable capability should be programmatically invoked or mapped
to generated surfaces.

It emits operation metadata. It does not contain business logic.

### `bindApiHandlers()`

Connects operation metadata to implementation functions.

Use it when tests, CLIs, dashboards, and generated clients should share one
handler path.

It emits a bound API. It does not generate a CLI by itself.

### `invokeOperation()`

Invokes one bound operation by id, parses input, runs the handler, and parses
output.

Use it as the common runtime path for generated adapters.

It emits the operation result. It does not own retries, permissions, or
transport policy.

### `createOperationSurface()`

Converts operations into a compatibility surface.

Use it when removed or renamed operations should appear in existing feature
diffs and impact reports.

It emits a `Surface`. It does not decide whether schema or projection changes
are breaking.

### `defineCliProjection()`

Defines command metadata for a generated CLI.

Use it when operation or schema metadata should become commands, flags, prompts,
machine JSON endpoints, output modes, or exit-code mappings.

It emits CLI projection metadata. It does not parse process arguments.

### `defineDashboardProjection()`

Defines local dashboard metadata.

Use it when operation or schema metadata should become forms, tables, details,
summaries, empty states, or local transport calls.

It emits dashboard projection metadata. It does not store durable dashboard
state.

### `defineMcpProjection()`

Defines MCP tool projection metadata.

Use it when selected operations should become MCP tools with explicit names,
annotations, result content behavior, or feature ids.

It emits MCP projection metadata. It does not import the MCP SDK or register
runtime tools.

### `defineProjectionSet()`

Groups CLI, dashboard, and MCP projections.

Use it when a package wants to serialize projections independently from the
operations that reference them.

It emits a projection set. It does not generate files.

### `generatePackageManifest()`

Emits `api-contract.json` with existing catalogs and surfaces plus
`x-interface` metadata.

Use it when one source should produce the package manifest.

It emits a manifest. It does not run validation outside the metadata shape.

### `generateApiSurfaceMarkdown()`

Renders `API_SURFACE.md` from a manifest.

Use it when maintainers need deterministic human review output.

It emits markdown. It does not infer hidden runtime behavior.

### `generateCliDescriptor()`

Produces a CLI descriptor with human commands and machine-stable JSON commands.

Use it when a CLI should be generated from operation and schema metadata.

It emits a descriptor. It does not execute business logic.

### `generateDashboardManifest()`

Produces local dashboard metadata.

Use it when a dashboard should render operations, forms, result views, and local
invoke commands from the same metadata.

It emits a dashboard manifest. It does not become state authority.

### `generateMcpDescriptor()`

Produces an MCP descriptor from operation metadata.

Use it when maintainers need reviewable MCP tool exposure before generating or
running a server adapter.

It emits `api-contract.mcp.v1` metadata. It does not import or execute MCP SDK
code.

### `generateMcpServerModule()`

Produces TypeScript source for a thin MCP stdio server adapter.

Use it when a consuming package wants generated `registerTool()` boilerplate
that invokes bound operation handlers.

It emits source text with `createMcpServer(api)` and `main(api)`. It does not
bundle handlers, install dependencies, or add MCP resources and prompts.

### `generateTypeScriptClient()`

Produces deterministic TypeScript client source for operation invocation.

Use it when consumers need generated client code instead of hand-written
wrappers.

It emits source text. It does not execute the client.

### `generateMachineCliRouter()`

Produces a machine CLI router descriptor.

Use it when dashboards and automation need stable `api describe` and
`api invoke` routes.

It emits route metadata. It does not scrape human CLI output.

## Example Matrix

All examples are neutral and intentionally package-agnostic.
Executable examples live in
[`examples/combinations`](examples/combinations/README.md).

| Example | Combination | Why use it |
| --- | --- | --- |
| [`compatibility-only`](examples/combinations/compatibility-only/README.md) | Feature catalogs plus supported/required surfaces | Publish capability compatibility and ledgers before adding operation handlers. |
| [`schema-metadata-only`](examples/combinations/schema-metadata-only/README.md) | Generic schema metadata only | Share validation, prompt, form, and table metadata without a runtime API. |
| [`programmatic-api-only`](examples/combinations/programmatic-api-only/README.md) | Operations plus handlers | Establish one invocation path for tests and library consumers. |
| [`api-plus-cli`](examples/combinations/api-plus-cli/README.md) | Operations plus CLI projection | Generate human commands and machine JSON routes while keeping CLI code thin. |
| [`api-plus-dashboard`](examples/combinations/api-plus-dashboard/README.md) | Operations plus dashboard projection | Generate local dashboard view metadata that invokes the same operations. |
| [`api-plus-mcp`](examples/combinations/api-plus-mcp/README.md) | Operations plus MCP projection | Expose selected operations as MCP tools without adding business logic to the MCP layer. |
| [`schema-plus-cli`](examples/combinations/schema-plus-cli/README.md) | Schemas plus CLI projection | Generate validation or inspection command metadata from schemas alone. |
| [`schema-plus-dashboard`](examples/combinations/schema-plus-dashboard/README.md) | Schemas plus dashboard projection | Generate dashboard form/table metadata from schemas before operations exist. |
| [`full-stack`](examples/combinations/full-stack/README.md) | Schemas, operations, handlers, CLI, dashboard, MCP, receipts, manifest, ledger, and generated source | Show the complete one-source contract workflow across all generated surfaces. |

Use names such as `workspace-tool`, `project-console`, and `acme-tool` in
public examples.

## Compatibility Workflow

```sh
api-contract check --manifest api-contract.json
api-contract ledger --manifest api-contract.json --out API_SURFACE.md
api-contract ledger --manifest api-contract.json --check API_SURFACE.md
api-contract diff --before old-api-contract.json --after api-contract.json
api-contract impact --before old-api-contract.json --after api-contract.json --consumers consumers.json
api-contract usage scan --target src --package-name acme-tool --dependency workspace-tool --catalog api-contract.json --out api-usage.json
```

`impact` is intended as a cheap preflight for explicit many-repo impact runs.
Read the latest consumer manifests or usage files first; then run full dependent
repo checks only for consumers that actually use changed features.

`usage scan` is a line-oriented source preflight. It records dependency and
feature-string evidence, but it is not a full parser or proof of semantic usage.

## Design Rules

- Keep business logic in programmatic handlers.
- Treat CLI, dashboard, and MCP as projections.
- Let dashboards call machine-stable CLI JSON commands, not human prompt text.
- Make MCP exposure explicit by default.
- Keep README prose and dashboard layout hints out of compatibility hashes
  unless they are explicitly mapped to feature ids.
- Use bounded docs references instead of embedding unbounded markdown by
  default.
- Keep host-specific validation in the host package.
- Preserve the existing `api-contract.package.v1` manifest envelope.
- Put richer generation metadata under `x-interface`.
- Keep this package generic. Host packages may map their own domain concepts
  into schema, operation, CLI, dashboard, MCP, and evidence metadata later.

## Subpath Exports

```txt
@async/api-contract
@async/api-contract/schema
@async/api-contract/interface
@async/api-contract/projection
@async/api-contract/generators
@async/api-contract/types
```

`@async/api-contract` owns the stable compatibility core: feature catalogs,
surfaces, hashes, manifest parsing, diffing, impact reports, usage scan, and API
surface markdown rendering.

`@async/api-contract/schema` owns generic schema metadata.

`@async/api-contract/interface` owns programmatic operation contracts.

`@async/api-contract/projection` owns CLI, dashboard, and MCP projection
metadata.

`@async/api-contract/generators` owns deterministic artifact generators.

`@async/api-contract/types` owns type-only compatibility helpers.

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
