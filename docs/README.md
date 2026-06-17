# @async/api-contract

`@async/api-contract` publishes semantic API surfaces, review ledgers, operation contracts, generated CLI/dashboard descriptors, and impact checks for Async packages.

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

## Product model

- Define one operation contract with `defineApiContract()` and `defineOperation()`.
- Bind programmatic handlers with `bindApiHandlers()`.
- Generate `api-contract.json`, `API_SURFACE.md`, CLI descriptors, and dashboard manifests from the same source.
- Let dashboards call machine-stable CLI JSON commands instead of scraping human prompt output.

## Package contract

- [API_SURFACE.md](https://github.com/async/api-contract/blob/main/API_SURFACE.md) is the generated review ledger.
- [api-contract.json](https://github.com/async/api-contract/blob/main/api-contract.json) is the checked manifest that produces the ledger.
- [README.md](https://github.com/async/api-contract/blob/main/README.md) has the public API and CLI examples.
