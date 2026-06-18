import { defineApiContract, defineOperation } from "@async/api-contract/interface";
import { generateMcpDescriptor, generateMcpServerModule } from "@async/api-contract/generators";
import { jsonSchemaAdapter } from "@async/api-contract/schema";

const inspectInput = jsonSchemaAdapter({
  type: "object",
  properties: {
    path: { type: "string", default: "." }
  }
});

const inspectOutput = jsonSchemaAdapter({
  type: "object",
  required: ["summary"],
  properties: {
    summary: { type: "string" }
  }
});

const contract = defineApiContract({
  packageName: "project-console",
  operations: [
    defineOperation({
      id: "project.inspect",
      title: "Inspect project",
      description: "Inspect local project metadata and return a short summary.",
      input: inspectInput,
      output: inspectOutput,
      effects: ["filesystem.read"],
      mcp: {
        toolName: "project.inspect",
        title: "Inspect project",
        resultContent: "json-text",
        featureId: "mcp.project.inspect"
      }
    })
  ]
});

const serverSource = generateMcpServerModule(contract, {
  serverName: "project-console",
  serverVersion: "1.0.0"
});

console.log(JSON.stringify({
  descriptor: generateMcpDescriptor(contract, {
    serverName: "project-console",
    serverVersion: "1.0.0"
  }),
  serverSourcePreview: serverSource.split("\n").slice(0, 12)
}, null, 2));
