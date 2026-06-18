# Combination Examples

These examples show how the same generic contract model can be used for
different API concerns. They are intentionally neutral and use only
`workspace-tool`, `project-console`, and `acme-tool` names.

Run any example after building the package:

```sh
pnpm build
node examples/combinations/full-stack/example.js
```

| Example | Combination | Why use it |
| --- | --- | --- |
| [`compatibility-only`](compatibility-only/README.md) | Feature catalogs plus surfaces | Publish supported/required capabilities and generate review ledgers before adding runtime APIs. |
| [`schema-metadata-only`](schema-metadata-only/README.md) | Schemas only | Publish validation, prompt, form, and table metadata without exposing callable operations. |
| [`programmatic-api-only`](programmatic-api-only/README.md) | Operations plus handlers | Establish one handler-backed API path for tests and library consumers. |
| [`api-plus-cli`](api-plus-cli/README.md) | Operations plus CLI projection | Generate human commands and machine JSON routes while keeping CLI logic thin. |
| [`api-plus-dashboard`](api-plus-dashboard/README.md) | Operations plus dashboard projection | Generate local dashboard view metadata that invokes operations instead of duplicating behavior. |
| [`api-plus-mcp`](api-plus-mcp/README.md) | Operations plus MCP projection | Expose selected operations as MCP tools through generated descriptor/source metadata. |
| [`schema-plus-cli`](schema-plus-cli/README.md) | Schemas plus CLI projection | Build validation or inspection CLIs from schema metadata without operation handlers. |
| [`schema-plus-dashboard`](schema-plus-dashboard/README.md) | Schemas plus dashboard projection | Render dashboard forms/tables from schemas before an operation API exists. |
| [`full-stack`](full-stack/README.md) | Schemas, operations, CLI, dashboard, MCP, receipts, manifest, ledger, and generated source | Show the complete one-source contract workflow across all projections. |

The examples print generated metadata or invocation results. They do not write
files, spawn processes, install dependencies, or execute MCP servers.
