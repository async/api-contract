import { createSurface, defineFeatureCatalog } from "@async/api-contract";
import { defineApiContract, generatePackageManifest } from "@async/api-contract/interface";
import { defineDashboardProjection, defineProjectionSet } from "@async/api-contract/projection";
import { createSchemaFeature, defineSchema, jsonSchemaAdapter } from "@async/api-contract/schema";

const reportSchema = defineSchema({
  id: "project.report",
  title: "Project report",
  adapter: jsonSchemaAdapter({
    type: "object",
    required: ["title", "status"],
    properties: {
      title: { type: "string" },
      status: { type: "string", enum: ["ready", "blocked", "review"] },
      updatedAt: { type: "string", format: "date-time" }
    }
  }),
  fields: [
    { field: "title", label: "Title", widget: "text" },
    {
      field: "status",
      label: "Status",
      widget: "radio",
      enumLabels: {
        ready: "Ready",
        blocked: "Blocked",
        review: "Needs review"
      }
    }
  ]
});

const catalog = defineFeatureCatalog({
  format: "api-contract.catalog.v1",
  contractId: "project-console.schema-dashboard",
  title: "Project Console Schema Dashboard Surface",
  features: [
    createSchemaFeature(reportSchema, { stability: "stable" }),
    {
      id: "projection.dashboard.report.table",
      title: "Report table dashboard projection",
      releaseTag: "public",
      stability: "stable",
      lifecycle: "active",
      group: "projections"
    }
  ]
});

const contract = defineApiContract({
  packageName: "project-console",
  contractId: "project-console.schema-dashboard",
  schemas: [reportSchema],
  projections: defineProjectionSet({
    dashboard: [
      defineDashboardProjection({
        group: "Reports",
        view: "table",
        resultView: "detail",
        transport: "none",
        emptyState: "No reports available."
      })
    ]
  }),
  operations: []
});

const manifest = generatePackageManifest(contract, {
  includeOperationCatalog: false,
  includeOperationSurface: false,
  base: {
    catalogs: [catalog],
    supported: [
      createSurface({
        contractId: catalog.contractId,
        features: ["schema.project.report", "projection.dashboard.report.table"]
      })
    ]
  }
});

console.log(JSON.stringify(manifest, null, 2));
