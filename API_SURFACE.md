# @async/api-contract API Surface Ledger

This file is the generated review ledger for semantic API contract features. It is current-state contract documentation, not a changelog or tutorial.

## Async API Contract CLI

Contract: `@async/api-contract.cli`

### Analysis

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `cli.diff` | Package contract diff command | public | stable | active |  | [docs](https://github.com/async/api-contract#cli) |
| `cli.impact` | Consumer impact report command | public | stable | active |  | [docs](https://github.com/async/api-contract#cli) |
| `cli.usage.scan` | Line-oriented dependency usage scan command | beta | preview | active |  | [docs](https://github.com/async/api-contract#cli) |

### Ledger

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `cli.ledger` | API surface ledger generation and drift check command | public | stable | active |  | [docs](https://github.com/async/api-contract#cli) |

### Manifest

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `cli.check` | Manifest validation command | public | stable | active |  | [docs](https://github.com/async/api-contract#cli) |

## Async API Contract Package Exports

Contract: `@async/api-contract.package-exports`

### Bin

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `bin.api-contract` | api-contract executable | public | stable | active |  | [docs](https://github.com/async/api-contract#cli) |

### Exports

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `export.generators` | Generator helper export | public | stable | active |  | [docs](https://github.com/async/api-contract#tooling-overview) |
| `export.interface` | Operation interface helper export | public | stable | active |  | [docs](https://github.com/async/api-contract#tooling-overview) |
| `export.projection` | Projection metadata helper export | public | stable | active |  | [docs](https://github.com/async/api-contract#subpath-exports) |
| `export.root` | Runtime API root export | public | stable | active |  | [docs](https://github.com/async/api-contract#quick-start) |
| `export.schema` | Schema metadata helper export | public | stable | active |  | [docs](https://github.com/async/api-contract#subpath-exports) |
| `export.types` | Type-only contract helper export | public | stable | active |  | [docs](https://github.com/async/api-contract#type-only-contracts) |

## Async API Contract Runtime API

Contract: `@async/api-contract.runtime`

### Catalog

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.catalog.defineFeatureCatalog` | Feature catalog declaration helper | public | stable | active |  |  |

### Compare

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.compare.compareSurface` | Required-versus-supported surface comparison | public | stable | active |  |  |

### Derive

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.derive.deriveSurface` | Runtime value-to-surface derivation | public | stable | active |  |  |

### Diff

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.diff.diffPackageContracts` | Package manifest diff calculation | public | stable | active |  |  |

### Generators

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.generators.generateApiSurfaceMarkdown` | API surface markdown generator | public | stable | active |  |  |
| `runtime.generators.generateMachineCliRouter` | Machine CLI router descriptor generator | public | stable | active |  |  |
| `runtime.generators.generateMcpDescriptor` | MCP descriptor generator | public | stable | active |  |  |
| `runtime.generators.generateMcpServerModule` | MCP stdio server module source generator | public | stable | active |  |  |
| `runtime.generators.generateTypeScriptClient` | TypeScript client source generator | public | stable | active |  |  |
| `runtime.interface.generateCliDescriptor` | CLI descriptor generator | public | stable | active |  |  |
| `runtime.interface.generateDashboardManifest` | Dashboard manifest generator | public | stable | active |  |  |
| `runtime.interface.generatePackageManifest` | Package manifest generator with interface metadata | public | stable | active |  |  |
| `runtime.interface.renderInterfaceMarkdown` | Operation interface markdown renderer | public | stable | active |  |  |

### Hash

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.hash.surfaceHash` | Stable surface hash calculation | public | stable | active |  |  |

### Impact

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.impact.createImpactReport` | Consumer impact report calculation | public | stable | active |  |  |

### Interface

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.interface.bindApiHandlers` | Operation handler binding helper | public | stable | active |  |  |
| `runtime.interface.createOperationFeatureCatalog` | Operation feature catalog derivation | public | stable | active |  |  |
| `runtime.interface.createOperationSurface` | Operation surface derivation | public | stable | active |  |  |
| `runtime.interface.defineApiContract` | Operation contract declaration helper | public | stable | active |  |  |
| `runtime.interface.defineJsonSchema` | Portable JSON Schema adapter helper | public | stable | active |  |  |
| `runtime.interface.defineOperation` | Operation declaration helper | public | stable | active |  |  |
| `runtime.interface.invokeOperation` | Bound operation invocation helper | public | stable | active |  |  |
| `runtime.interface.serializeApiInterface` | Operation interface serializer | public | stable | active |  |  |

### Ledger

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.ledger.renderApiSurfaceMarkdown` | API surface markdown ledger renderer | public | stable | active |  |  |

### Manifest

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.manifest.parsePackageContractManifest` | Package contract manifest parser and validator | public | stable | active |  |  |

### Projection

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.projection.defineCliProjection` | CLI projection declaration helper | public | stable | active |  |  |
| `runtime.projection.defineDashboardProjection` | Dashboard projection declaration helper | public | stable | active |  |  |
| `runtime.projection.defineMcpProjection` | MCP projection declaration helper | public | stable | active |  |  |
| `runtime.projection.defineProjectionSet` | Projection set declaration helper | public | stable | active |  |  |

### Schema

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.schema.createSchemaFeature` | Schema feature derivation helper | public | stable | active |  |  |
| `runtime.schema.defineSchema` | Schema metadata declaration helper | public | stable | active |  |  |
| `runtime.schema.jsonSchemaAdapter` | JSON Schema adapter helper | public | stable | active |  |  |
| `runtime.schema.standardSchemaAdapter` | Standard Schema adapter helper | public | stable | active |  |  |

### Surface

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.surface.createSurface` | Normalized API surface creation | public | stable | active |  |  |

### Usage

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `runtime.usage.scanUsageTarget` | Line-oriented source usage scanner | beta | preview | active |  |  |

## Async API Contract Type Exports

Contract: `@async/api-contract.type-exports`

### Generators

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `type.CliDescriptor` | Generated CLI descriptor type | public | stable | active |  |  |
| `type.DashboardManifest` | Generated dashboard manifest type | public | stable | active |  |  |
| `type.MachineCliRouterDescriptor` | Machine CLI router descriptor type | public | stable | active |  |  |
| `type.McpDescriptor` | Generated MCP descriptor type | public | stable | active |  |  |
| `type.McpDescriptorOptions` | MCP descriptor generator options type | public | stable | active |  |  |
| `type.McpExposure` | MCP exposure mode type | public | stable | active |  |  |
| `type.McpServerModuleOptions` | MCP server module generator options type | public | stable | active |  |  |
| `type.McpToolDescriptor` | Generated MCP tool descriptor type | public | stable | active |  |  |
| `type.TypeScriptClientOptions` | TypeScript client generator options type | public | stable | active |  |  |

### Interface

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `type.ApiContract` | Operation contract type | public | stable | active |  |  |
| `type.ApiHandlersFor` | Typed operation handler map helper | public | stable | active |  |  |
| `type.BoundApi` | Bound operation API type | public | stable | active |  |  |
| `type.InferOperationInput` | Operation input inference helper | public | stable | active |  |  |
| `type.InferOperationOutput` | Operation output inference helper | public | stable | active |  |  |
| `type.OperationHandler` | Operation handler type | public | stable | active |  |  |
| `type.OperationSpec` | Callable operation specification type | public | stable | active |  |  |

### Model

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `type.PackageContractManifest` | Package contract manifest type | public | stable | active |  |  |
| `type.Surface` | Normalized API surface type | public | stable | active |  |  |

### Projection

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `type.McpProjection` | MCP projection metadata type | public | stable | active |  |  |
| `type.McpResultContent` | MCP result content mode type | public | stable | active |  |  |
| `type.ProjectionSet` | Projection set type | public | stable | active |  |  |

### Schema

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `type.DefineSchemaInput` | Schema metadata declaration input type | public | stable | active |  |  |
| `type.SchemaAdapter` | Operation schema adapter type | public | stable | active |  |  |
| `type.SchemaMetadata` | Schema metadata type | public | stable | active |  |  |
| `type.StandardSchemaLike` | Standard Schema-like adapter input type | public | stable | active |  |  |

### Type Contracts

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `type.AssertCompatible` | Compile-time compatibility assertion | public | stable | active |  | [docs](https://github.com/async/api-contract#type-only-contracts) |
| `type.ContractRef` | Phantom contract reference type | public | stable | active |  | [docs](https://github.com/async/api-contract#type-only-contracts) |
| `type.Expect` | Compile-time expectation helper | public | stable | active |  | [docs](https://github.com/async/api-contract#type-only-contracts) |
| `type.RequiresContract` | Required contract phantom type | public | stable | active |  | [docs](https://github.com/async/api-contract#type-only-contracts) |
| `type.SupportsContract` | Supported contract phantom type | public | stable | active |  | [docs](https://github.com/async/api-contract#type-only-contracts) |

## Async API Contract Package Metadata

Contract: `@async/api-contract.package-metadata`

### Engines

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `metadata.engines.node` | Node.js engine floor | public | stable | active |  |  |

### Files

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `metadata.files.ledger` | API surface ledger is included in package files | public | stable | active |  |  |
| `metadata.files.manifest` | API contract manifest is included in package files | public | stable | active |  |  |

### Metadata

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `metadata.license.mit` | MIT license declaration | public | stable | active |  |  |
| `metadata.repository.github` | GitHub repository metadata | public | stable | active |  |  |
| `metadata.sideEffects.false` | Side-effect-free package declaration | public | stable | active |  |  |

### Package Manager

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `metadata.packageManager.pnpm` | pnpm package manager declaration | public | stable | active |  |  |

### Publish

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `metadata.publish.public` | Public npm publish access | public | stable | active |  |  |

## Supported Surfaces

| Contract | Hash | Features |
| --- | --- | --- |
| `@async/api-contract.cli` | `sha256:f3a9be69ec7b7f71c660c3e3395b5fe6619804248c16ad33fdba63ccc2d67a38` | `cli.check`, `cli.diff`, `cli.impact`, `cli.ledger`, `cli.usage.scan` |
| `@async/api-contract.package-exports` | `sha256:a0ba11db988ff4683c33ae039c87519229110631ad7ecec36bf6bbbcdf04e8d1` | `bin.api-contract`, `export.generators`, `export.interface`, `export.projection`, `export.root`, `export.schema`, `export.types` |
| `@async/api-contract.package-metadata` | `sha256:d7f3950ee79a616b25eb90d0e9947dac55bd14688b4beffa5420154009448927` | `metadata.engines.node`, `metadata.files.ledger`, `metadata.files.manifest`, `metadata.license.mit`, `metadata.packageManager.pnpm`, `metadata.publish.public`, `metadata.repository.github`, `metadata.sideEffects.false` |
| `@async/api-contract.runtime` | `sha256:7017eb0e6809823feda40c73e8dec051ef7a4d8553ca815e2e85268098b64f77` | `runtime.catalog.defineFeatureCatalog`, `runtime.compare.compareSurface`, `runtime.derive.deriveSurface`, `runtime.diff.diffPackageContracts`, `runtime.generators.generateApiSurfaceMarkdown`, `runtime.generators.generateMachineCliRouter`, `runtime.generators.generateMcpDescriptor`, `runtime.generators.generateMcpServerModule`, `runtime.generators.generateTypeScriptClient`, `runtime.hash.surfaceHash`, `runtime.impact.createImpactReport`, `runtime.interface.bindApiHandlers`, `runtime.interface.createOperationFeatureCatalog`, `runtime.interface.createOperationSurface`, `runtime.interface.defineApiContract`, `runtime.interface.defineJsonSchema`, `runtime.interface.defineOperation`, `runtime.interface.generateCliDescriptor`, `runtime.interface.generateDashboardManifest`, `runtime.interface.generatePackageManifest`, `runtime.interface.invokeOperation`, `runtime.interface.renderInterfaceMarkdown`, `runtime.interface.serializeApiInterface`, `runtime.ledger.renderApiSurfaceMarkdown`, `runtime.manifest.parsePackageContractManifest`, `runtime.projection.defineCliProjection`, `runtime.projection.defineDashboardProjection`, `runtime.projection.defineMcpProjection`, `runtime.projection.defineProjectionSet`, `runtime.schema.createSchemaFeature`, `runtime.schema.defineSchema`, `runtime.schema.jsonSchemaAdapter`, `runtime.schema.standardSchemaAdapter`, `runtime.surface.createSurface`, `runtime.usage.scanUsageTarget` |
| `@async/api-contract.type-exports` | `sha256:a8a89ade664a585fa368d0f3dd6a84724a89406af575bcd4cb7c9a06e97b1708` | `type.ApiContract`, `type.ApiHandlersFor`, `type.AssertCompatible`, `type.BoundApi`, `type.CliDescriptor`, `type.ContractRef`, `type.DashboardManifest`, `type.DefineSchemaInput`, `type.Expect`, `type.InferOperationInput`, `type.InferOperationOutput`, `type.MachineCliRouterDescriptor`, `type.McpDescriptor`, `type.McpDescriptorOptions`, `type.McpExposure`, `type.McpProjection`, `type.McpResultContent`, `type.McpServerModuleOptions`, `type.McpToolDescriptor`, `type.OperationHandler`, `type.OperationSpec`, `type.PackageContractManifest`, `type.ProjectionSet`, `type.RequiresContract`, `type.SchemaAdapter`, `type.SchemaMetadata`, `type.StandardSchemaLike`, `type.SupportsContract`, `type.Surface`, `type.TypeScriptClientOptions` |

## Required Surfaces

| Contract | Hash | Features |
| --- | --- | --- |
| `@async/api-contract.cli` | `sha256:109f7d81379d251bd8df213020a09e5cb60ff5a0725701b944d95d5de35ba4bf` | `cli.check`, `cli.ledger` |
| `@async/pipeline.cli` | `sha256:d98fbabdc807d0a093266381164ba0442c8fe65c172b9fc7009280f91b236e8e` | `cli.github.check`, `cli.github.generate`, `cli.publish.github`, `cli.publish.npm`, `cli.release.doctor`, `cli.run`, `cli.run-task`, `cli.sync.check`, `cli.sync.generate` |
| `@async/pipeline.declaration` | `sha256:e0bea5c3eafe5addbd08abbb37b9e9df010995567fc878aba996a41fc1cfd625` | `config.definePipeline`, `config.env`, `config.github.pages`, `config.job`, `config.sync.github`, `config.sync.tasks`, `config.task`, `config.trigger.github`, `config.trigger.manual`, `step.shell` |
