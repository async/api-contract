# @async/api-contract

`@async/api-contract` publishes semantic API surfaces, schema metadata, operation contracts, CLI/dashboard/MCP projection metadata, deterministic generators, review ledgers, and impact checks for Async packages.

## Maintainer tasks

```sh
pnpm run pipeline:verify
pnpm run pipeline:api-surface
pnpm run pipeline:api-surface:generate
pnpm run pipeline:github:check
pnpm run pipeline:sync:check
pnpm run release:check
```

## Consumer install

```sh
pnpm add @async/api-contract
```

## Examples

- [Combination examples](https://github.com/async/api-contract/blob/main/examples/combinations/README.md) show compatibility-only, schema-only, programmatic API, CLI, dashboard, MCP, schema projection, and full-stack usage.

## Product model

- Define schema metadata with `@async/api-contract/schema`.
- Define one operation contract with `@async/api-contract/interface`.
- Define CLI, dashboard, and MCP projections with `@async/api-contract/projection`.
- Bind programmatic handlers with `bindApiHandlers()`.
- Generate `api-contract.json`, `API_SURFACE.md`, CLI descriptors, dashboard manifests, MCP descriptors, MCP stdio server source, machine CLI routers, and typed clients from the same source.
- Let dashboards call machine-stable CLI JSON commands instead of scraping human prompt output.
- Let generated MCP tools call `invokeOperation()` instead of duplicating handler logic.

## Subpaths

```txt
@async/api-contract
@async/api-contract/schema
@async/api-contract/interface
@async/api-contract/projection
@async/api-contract/generators
@async/api-contract/types
```

## Package contract

- [API_SURFACE.md](https://github.com/async/api-contract/blob/main/API_SURFACE.md) is the generated review ledger.
- [api-contract.json](https://github.com/async/api-contract/blob/main/api-contract.json) is the checked manifest that produces the ledger.
- [README.md](https://github.com/async/api-contract/blob/main/README.md) has the public API and CLI examples.
