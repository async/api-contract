# API Plus Dashboard

Combination: operation metadata plus dashboard projection metadata.

Use this when a local dashboard should render forms, summaries, logs, tables, or
detail views for operations without becoming a second implementation layer.

Why you want this combination:

- dashboard groups and views are generated from the same operation metadata as
  the programmatic API;
- the dashboard can invoke operations through the machine CLI transport;
- UI layout hints stay outside compatibility hashes unless explicitly mapped to
  feature ids.

This example demonstrates `generateDashboardManifest()` from an operation
contract with dashboard hints.

It deliberately does not create a web app or store durable dashboard state.

Run:

```sh
node examples/combinations/api-plus-dashboard/example.js
```
