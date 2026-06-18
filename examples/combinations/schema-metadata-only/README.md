# Schema Metadata Only

Combination: generic schema metadata without operations or generated user
surfaces.

Use this when a package wants to publish shape metadata for validation, prompts,
forms, tables, or docs, but does not yet expose callable operations.

Why you want this combination:

- schemas can drive validation and generated UI hints without picking one
  validator library for every consumer;
- field hints keep prompt and form metadata close to the schema;
- schema features can be added to compatibility ledgers when the shape is
  contract-bearing.

This example demonstrates `defineSchema()`, `jsonSchemaAdapter()`, field hints,
defaults, examples, and `createSchemaFeature()`.

It deliberately does not bind handlers, create CLI commands, or create dashboard
views.

Run:

```sh
node examples/combinations/schema-metadata-only/example.js
```
