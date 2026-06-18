import {
  createSurface,
  defineFeatureCatalog,
  renderApiSurfaceMarkdown
} from "@async/api-contract";

const catalog = defineFeatureCatalog({
  format: "api-contract.catalog.v1",
  contractId: "workspace-tool.package",
  title: "Workspace Tool Package Surface",
  features: [
    {
      id: "export.root",
      title: "Root package export",
      releaseTag: "public",
      stability: "stable",
      lifecycle: "active",
      group: "package-exports"
    },
    {
      id: "operation.project.init",
      title: "Project init operation",
      releaseTag: "public",
      stability: "stable",
      lifecycle: "active",
      group: "operations"
    },
    {
      id: "cli.api.invoke",
      title: "Machine JSON invoke command",
      releaseTag: "public",
      stability: "stable",
      lifecycle: "active",
      group: "cli"
    }
  ]
});

const manifest = {
  format: "api-contract.package.v1",
  packageName: "workspace-tool",
  catalogs: [catalog],
  supported: [
    createSurface({
      contractId: catalog.contractId,
      features: ["export.root", "operation.project.init", "cli.api.invoke"]
    })
  ],
  required: [
    createSurface({
      contractId: catalog.contractId,
      features: ["export.root", "operation.project.init"]
    })
  ]
};

console.log(renderApiSurfaceMarkdown({ manifest }));
