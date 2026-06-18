import { createSurface, defineFeatureCatalog } from "@async/api-contract";
import { defineApiContract, generatePackageManifest } from "@async/api-contract/interface";
import { defineCliProjection, defineProjectionSet } from "@async/api-contract/projection";
import { createSchemaFeature, defineSchema, jsonSchemaAdapter } from "@async/api-contract/schema";

const configSchema = defineSchema({
  id: "workspace.config",
  title: "Workspace config",
  adapter: jsonSchemaAdapter({
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      profile: { type: "string", enum: ["default", "strict"] }
    }
  }),
  fields: [
    {
      field: "profile",
      label: "Profile",
      widget: "select",
      enumLabels: {
        default: "Default",
        strict: "Strict"
      }
    }
  ]
});

const catalog = defineFeatureCatalog({
  format: "api-contract.catalog.v1",
  contractId: "workspace-tool.schema-cli",
  title: "Workspace Tool Schema CLI Surface",
  features: [
    createSchemaFeature(configSchema, { stability: "stable" }),
    {
      id: "projection.cli.config.validate",
      title: "Config validation CLI projection",
      releaseTag: "public",
      stability: "stable",
      lifecycle: "active",
      group: "projections"
    }
  ]
});

const contract = defineApiContract({
  packageName: "workspace-tool",
  contractId: "workspace-tool.schema-cli",
  schemas: [configSchema],
  projections: defineProjectionSet({
    cli: [
      defineCliProjection({
        command: ["config", "validate"],
        interactive: false,
        flags: [{ name: "input", type: "string", required: true }]
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
        features: ["schema.workspace.config", "projection.cli.config.validate"]
      })
    ]
  }
});

console.log(JSON.stringify(manifest, null, 2));
