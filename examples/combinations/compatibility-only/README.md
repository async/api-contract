# Compatibility Only

Combination: feature catalogs plus supported and required surfaces.

Use this when a package needs to publish what capabilities it supports or
requires, but does not need operation handlers, schema metadata, generated CLI
commands, dashboards, or MCP tools yet.

Why you want this combination:

- it gives maintainers a deterministic compatibility ledger;
- it lets consumers compare required features against supported features;
- it keeps compatibility independent of package versions.

This example demonstrates `defineFeatureCatalog()`, `createSurface()`, and
`renderApiSurfaceMarkdown()`.

It deliberately does not define business logic, input schemas, handlers, or
projection metadata.

Run:

```sh
node examples/combinations/compatibility-only/example.js
```
