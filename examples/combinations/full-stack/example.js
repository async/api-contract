import {
  bindApiHandlers,
  defineApiContract,
  defineOperation,
  generatePackageManifest,
  invokeOperation
} from "@async/api-contract/interface";
import {
  generateCliDescriptor,
  generateDashboardManifest,
  generateMachineCliRouter,
  generateMcpDescriptor,
  generateMcpServerModule,
  generateTypeScriptClient
} from "@async/api-contract/generators";
import { renderApiSurfaceMarkdown } from "@async/api-contract";
import { defineSchema, jsonSchemaAdapter } from "@async/api-contract/schema";

const projectInput = jsonSchemaAdapter({
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string" },
    directory: { type: "string", default: "." }
  }
}, {
  parse(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("input must be an object");
    }
    if (typeof value.name !== "string") throw new Error("name must be a string");
    return {
      name: value.name,
      directory: typeof value.directory === "string" ? value.directory : "."
    };
  },
  defaults: () => ({ directory: "." })
});

const projectOutput = jsonSchemaAdapter({
  type: "object",
  required: ["ok", "receiptPath"],
  properties: {
    ok: { type: "boolean" },
    receiptPath: { type: "string" }
  }
});

const projectConfig = defineSchema({
  id: "project.config",
  title: "Project config",
  adapter: projectInput,
  fields: [
    { field: "name", label: "Project name", widget: "text" },
    { field: "directory", label: "Directory", widget: "path" }
  ]
});

const contract = defineApiContract({
  packageName: "acme-tool",
  title: "Acme Tool",
  docs: [
    {
      id: "readme",
      path: "README.md",
      summary: "Explains generated API, CLI, dashboard, and MCP surfaces."
    }
  ],
  schemas: [projectConfig],
  operations: [
    defineOperation({
      id: "project.init",
      title: "Initialize project",
      description: "Create local project files and write an init receipt.",
      input: projectInput,
      output: projectOutput,
      effects: ["filesystem.write"],
      receipts: [
        { kind: "receipt", pathTemplate: "receipts/init-{timestamp}.json", required: true }
      ],
      docs: ["readme"],
      cli: {
        command: ["project", "init"],
        interactive: true,
        flags: [{ name: "name", type: "string", required: true }]
      },
      dashboard: {
        group: "Project",
        view: "form",
        resultView: "summary",
        transport: "machine-cli"
      },
      mcp: {
        toolName: "project.init",
        title: "Initialize project",
        resultContent: "json-text",
        featureId: "mcp.project.init"
      }
    }),
    defineOperation({
      id: "project.verify",
      title: "Verify project",
      description: "Read local project files and write a verification report.",
      output: projectOutput,
      effects: ["filesystem.read"],
      receipts: [
        { kind: "verification", pathTemplate: "receipts/verify-{timestamp}.json" }
      ],
      cli: { command: ["project", "verify"] },
      dashboard: {
        group: "Project",
        view: "summary",
        resultView: "log",
        transport: "machine-cli"
      }
    })
  ]
});

const api = bindApiHandlers(contract, {
  "project.init": async (input) => ({
    ok: true,
    receiptPath: `${input.directory}/receipts/init.json`
  }),
  "project.verify": async () => ({
    ok: true,
    receiptPath: "receipts/verify.json"
  })
});

const manifest = generatePackageManifest(contract);
const mcpServerSource = generateMcpServerModule(contract, {
  serverName: "acme-tool",
  serverVersion: "1.0.0"
});

console.log(JSON.stringify({
  invocation: await invokeOperation(api, "project.init", { name: "Acme Tool" }),
  manifestFormat: manifest.format,
  ledgerPreview: renderApiSurfaceMarkdown({ manifest }).split("\n").slice(0, 12),
  cliCommands: generateCliDescriptor(contract, { binaryName: "acme-tool" }).commands.map((command) => command.command),
  dashboardViews: generateDashboardManifest(contract, { binaryName: "acme-tool" }).operations.map((operation) => operation.view),
  machineRoutes: generateMachineCliRouter(contract, { binaryName: "acme-tool" }).routes.map((route) => route.invoke),
  mcpTools: generateMcpDescriptor(contract, { serverName: "acme-tool" }).tools.map((tool) => tool.name),
  clientPreview: generateTypeScriptClient(contract, { clientName: "acmeClient" }).split("\n").slice(0, 8),
  mcpServerPreview: mcpServerSource.split("\n").slice(0, 12)
}, null, 2));
