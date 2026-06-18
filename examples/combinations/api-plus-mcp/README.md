# API Plus MCP

Combination: operation metadata plus MCP projection metadata.

Use this when selected operations should be exposed as MCP tools for agent
clients while business logic remains behind `invokeOperation()`.

Why you want this combination:

- MCP tool exposure is explicit and reviewable;
- tool schemas, effects, receipts, annotations, and feature ids come from the
  operation contract;
- the generated server module is a thin adapter and does not add an MCP runtime
  dependency to `@async/api-contract`.

This example demonstrates `generateMcpDescriptor()` and
`generateMcpServerModule()` for a stdio tool server adapter.

It deliberately does not run an MCP server, import handler logic, expose MCP
resources, or expose MCP prompts.

Run:

```sh
node examples/combinations/api-plus-mcp/example.js
```
