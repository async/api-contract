# @async/api-contract

`@async/api-contract` publishes semantic API surfaces, review ledgers, and impact checks for Async packages.

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

## Package contract

- [API_SURFACE.md](https://github.com/async/api-contract/blob/main/API_SURFACE.md) is the generated review ledger.
- [api-contract.json](https://github.com/async/api-contract/blob/main/api-contract.json) is the checked manifest that produces the ledger.
- [README.md](https://github.com/async/api-contract/blob/main/README.md) has the public API and CLI examples.
