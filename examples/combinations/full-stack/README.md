# Full Stack

Combination: schemas, operations, handlers, CLI, dashboard, MCP, receipts,
manifest, ledger, router, and generated client/source artifacts.

Use this when a package is ready to maintain one API source while projecting it
into every supported surface.

Why you want this combination:

- the programmatic handler is the only business-logic path;
- CLI, dashboard, MCP, and generated clients all route through the same
  operation ids;
- effects and receipts make local side effects reviewable before execution;
- `api-contract.json` and `API_SURFACE.md` make changes visible in compatibility
  workflows.

This example demonstrates `defineApiContract()`, `defineOperation()`,
`bindApiHandlers()`, `generatePackageManifest()`, `renderApiSurfaceMarkdown()`,
`generateCliDescriptor()`, `generateDashboardManifest()`,
`generateMachineCliRouter()`, `generateMcpDescriptor()`,
`generateMcpServerModule()`, and `generateTypeScriptClient()`.

It deliberately prints previews instead of writing files, spawning processes, or
running an MCP server.

Run:

```sh
node examples/combinations/full-stack/example.js
```
