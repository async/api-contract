# API Plus CLI

Combination: operation metadata plus CLI projection metadata.

Use this when humans need ergonomic commands and automation needs stable machine
JSON routes, while implementation still lives in programmatic handlers.

Why you want this combination:

- command names, flags, and interactive hints are generated from metadata;
- dashboards and scripts can call `api describe` and `api invoke` routes instead
  of scraping human prompt output;
- CLI changes stay reviewable as projection metadata.

This example demonstrates `generateCliDescriptor()` and
`generateMachineCliRouter()` from an operation contract with CLI hints.

It deliberately does not parse process arguments or implement terminal prompts.

Run:

```sh
node examples/combinations/api-plus-cli/example.js
```
