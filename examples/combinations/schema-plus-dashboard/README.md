# Schema Plus Dashboard

Combination: schema metadata plus dashboard projection metadata without
operation handlers.

Use this when a local dashboard should render forms, tables, or detail views
from schema metadata alone.

Why you want this combination:

- schemas can drive dashboard tables and forms before an operation API exists;
- field labels, widgets, enum labels, and empty states remain metadata;
- contract-bearing schema/dashboard capabilities can still be reviewed in a
  manifest and ledger.

This example demonstrates a schema catalog, a dashboard projection set, and a
package manifest with schema/dashboard metadata and no operations.

It deliberately does not invoke handlers, create a dashboard runtime, or own
durable state.

Run:

```sh
node examples/combinations/schema-plus-dashboard/example.js
```
