# Schema Plus CLI

Combination: schema metadata plus CLI projection metadata without operation
handlers.

Use this when a tool only needs validation, inspection, or form-like CLI
commands over schema metadata.

Why you want this combination:

- JSON Schema and field hints can drive validation commands and prompts;
- a package can publish CLI-facing metadata before it has callable operations;
- schema and projection features can still appear in compatibility diffs.

This example demonstrates a schema catalog, a schema-derived feature, a CLI
projection set, and a package manifest that carries `x-interface` metadata with
no operations.

It deliberately does not bind handlers or generate a runtime CLI parser.

Run:

```sh
node examples/combinations/schema-plus-cli/example.js
```
