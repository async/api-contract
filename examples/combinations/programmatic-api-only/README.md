# Programmatic API Only

Combination: operation metadata plus bound handlers.

Use this when tests and library consumers need a stable callable API, but you do
not want to publish a CLI, dashboard, or MCP server yet.

Why you want this combination:

- operation ids become the durable invocation contract;
- handlers stay outside metadata while still being type-aligned with operations;
- `invokeOperation()` gives one runtime path that future adapters can reuse.

This example demonstrates `defineApiContract()`, `defineOperation()`,
`bindApiHandlers()`, and `invokeOperation()`.

It deliberately does not generate a CLI descriptor, dashboard manifest, or MCP
server module.

Run:

```sh
node examples/combinations/programmatic-api-only/example.js
```
