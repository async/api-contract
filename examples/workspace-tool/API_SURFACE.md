# workspace-tool API Surface Ledger

This file is the generated review ledger for semantic API contract features. It is current-state contract documentation, not a changelog or tutorial.

## Workspace Tool Package Surface

Contract: `workspace-tool.package`

### Cli

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `cli.api.invoke` | Machine JSON invoke command | public | stable | active |  |  |

### Operations

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `operation.project.init` | Project init operation | public | stable | active |  |  |
| `operation.project.verify` | Project verify operation | beta | preview | active |  |  |

### Package Exports

| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| `export.root` | Root package export | public | stable | active |  |  |

## Supported Surfaces

| Contract | Hash | Features |
| --- | --- | --- |
| `workspace-tool.package` | `sha256:22652a63bfbdb6cfe94e0c64c2a902b945ca6d48202fc68732a381ab4d0ac7a8` | `cli.api.invoke`, `export.root`, `operation.project.init`, `operation.project.verify` |

## Required Surfaces

| Contract | Hash | Features |
| --- | --- | --- |
| `workspace-tool.package` | `sha256:5e8572366a476f17a9d6d317a13843b4e0dc4a0b1d094b77d325957428ae90e9` | `export.root`, `operation.project.init` |
