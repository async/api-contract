import { createSchemaFeature, defineSchema, jsonSchemaAdapter } from "@async/api-contract/schema";

const workspaceSettings = defineSchema({
  id: "workspace.settings",
  title: "Workspace settings",
  description: "Configuration values used by local workspace tooling.",
  adapter: jsonSchemaAdapter({
    type: "object",
    required: ["name", "rootDir"],
    properties: {
      name: { type: "string", description: "Human-readable workspace name." },
      rootDir: { type: "string", default: "." },
      strict: { type: "boolean", default: true }
    }
  }, {
    defaults: () => ({ rootDir: ".", strict: true }),
    examples: () => [{ name: "Acme Workspace", rootDir: ".", strict: true }]
  }),
  fields: [
    {
      field: "name",
      label: "Workspace name",
      helpText: "Shown in generated reports and dashboards.",
      widget: "text",
      prompt: "What is the workspace name?"
    },
    {
      field: "strict",
      label: "Strict mode",
      helpText: "Fail validation when optional checks are not available.",
      widget: "checkbox"
    }
  ]
});

console.log(JSON.stringify({
  feature: createSchemaFeature(workspaceSettings, { stability: "stable" }),
  jsonSchema: workspaceSettings.adapter.jsonSchema(),
  defaults: workspaceSettings.adapter.defaults?.(),
  examples: workspaceSettings.adapter.examples?.(),
  fields: workspaceSettings.fields
}, null, 2));
