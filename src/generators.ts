import { renderApiSurfaceMarkdown } from "./ledger.js";
import {
  generateCliDescriptor,
  generateDashboardManifest,
  generatePackageManifest,
  renderInterfaceMarkdown,
  serializeApiInterface
} from "./interface.js";
import type {
  ApiContract,
  CliCommandDescriptor,
  CliDescriptor,
  DashboardManifest,
  DashboardOperationDescriptor,
  GenerateManifestOptions,
  McpProjection,
  McpResultContent,
  OperationEffect,
  OperationId,
  OperationSpec,
  ReceiptSpec,
  SerializedSchemaMetadata
} from "./interface.js";
import type { ExtensionFields, PackageContractManifest, RenderLedgerInput } from "./model.js";

export {
  generateCliDescriptor,
  generateDashboardManifest,
  generatePackageManifest,
  renderInterfaceMarkdown
};

export type {
  CliCommandDescriptor,
  CliDescriptor,
  DashboardManifest,
  DashboardOperationDescriptor,
  GenerateManifestOptions
};

export interface TypeScriptClientOptions {
  clientName?: string;
  importPath?: string;
}

export interface MachineCliRouterOptions {
  binaryName?: string;
}

export interface MachineCliRouterDescriptor {
  format: "api-contract.machine-cli-router.v1";
  packageName: string;
  binaryName: string;
  routes: readonly MachineCliRouteDescriptor[];
}

export interface MachineCliRouteDescriptor {
  operationId: string;
  describe: readonly string[];
  invoke: readonly string[];
  inputSchema?: unknown;
  outputSchema?: unknown;
}

export type McpExposure = "explicit" | "all";

export interface McpDescriptorOptions {
  serverName?: string;
  serverVersion?: string;
  protocolTarget?: string;
  exposure?: McpExposure;
}

export interface McpServerModuleOptions extends McpDescriptorOptions {
  importPath?: string;
  mcpServerImport?: string;
  mcpStdioImport?: string;
}

export interface McpDescriptor extends ExtensionFields {
  format: "api-contract.mcp.v1";
  packageName: string;
  serverName: string;
  serverVersion: string;
  protocolTarget: string;
  schemas: readonly SerializedSchemaMetadata[];
  tools: readonly McpToolDescriptor[];
}

export interface McpToolDescriptor extends ExtensionFields {
  operationId: OperationId;
  featureId: string;
  name: string;
  title: string;
  description?: string;
  inputSchema: unknown;
  outputSchema?: unknown;
  effects: readonly OperationEffect[];
  receipts: readonly ReceiptSpec[];
  annotations?: Record<string, unknown>;
  resultContent: McpResultContent;
}

export function generateApiSurfaceMarkdown(input: RenderLedgerInput): string {
  return renderApiSurfaceMarkdown(input);
}

export function generateMachineCliRouter(contract: ApiContract, options: MachineCliRouterOptions = {}): MachineCliRouterDescriptor {
  const cli = generateCliDescriptor(contract, options);
  return {
    format: "api-contract.machine-cli-router.v1",
    packageName: contract.packageName,
    binaryName: cli.binaryName,
    routes: cli.commands.map((command) => ({
      operationId: command.operationId,
      describe: [cli.binaryName, "api", "describe", command.operationId, "--json"],
      invoke: command.invoke,
      ...(command.inputSchema === undefined ? {} : { inputSchema: command.inputSchema }),
      ...(command.outputSchema === undefined ? {} : { outputSchema: command.outputSchema })
    }))
  };
}

export function generateMcpDescriptor(contract: ApiContract, options: McpDescriptorOptions = {}): McpDescriptor {
  const apiInterface = serializeApiInterface(contract);
  return {
    format: "api-contract.mcp.v1",
    packageName: contract.packageName,
    serverName: options.serverName ?? packageNameWithoutScope(contract.packageName),
    serverVersion: options.serverVersion ?? "0.0.0",
    protocolTarget: options.protocolTarget ?? "2025-11-25",
    schemas: apiInterface.schemas ?? [],
    tools: mcpOperations(contract, options.exposure ?? "explicit").map(({ operation, projection }) => {
      const toolName = mcpToolName(operation, projection);
      return {
        operationId: operation.id,
        featureId: projection?.featureId ?? operation.featureId,
        name: toolName,
        title: projection?.title ?? operation.title,
        ...(projection?.description ?? operation.description ? { description: projection?.description ?? operation.description } : {}),
        inputSchema: operation.input?.jsonSchema() ?? emptyObjectSchema(),
        ...(operation.output === undefined ? {} : { outputSchema: operation.output.jsonSchema() }),
        effects: operation.effects ?? [],
        receipts: operation.receipts ?? [],
        ...(projection?.annotations === undefined ? {} : { annotations: projection.annotations }),
        resultContent: projection?.resultContent ?? "json-text"
      };
    })
  };
}

export function generateMcpServerModule(contract: ApiContract, options: McpServerModuleOptions = {}): string {
  const descriptor = generateMcpDescriptor(contract, options);
  const importPath = options.importPath ?? "@async/api-contract";
  const mcpServerImport = options.mcpServerImport ?? "@modelcontextprotocol/server";
  const mcpStdioImport = options.mcpStdioImport ?? "@modelcontextprotocol/server/stdio";
  const lines: string[] = [];

  lines.push("/* Generated by @async/api-contract. Do not put business logic in this file. */");
  lines.push(`import { invokeOperation } from ${JSON.stringify(importPath)};`);
  lines.push(`import type { BoundApi } from ${JSON.stringify(`${importPath}/interface`)};`);
  lines.push(`import { McpServer } from ${JSON.stringify(mcpServerImport)};`);
  lines.push(`import { StdioServerTransport } from ${JSON.stringify(mcpStdioImport)};`);
  lines.push("");
  lines.push("type McpResultContent = \"json-text\" | \"text\" | \"structured\";");
  lines.push("interface GeneratedMcpTool {");
  lines.push("  operationId: string;");
  lines.push("  name: string;");
  lines.push("  title: string;");
  lines.push("  description?: string;");
  lines.push("  inputSchema: unknown;");
  lines.push("  outputSchema?: unknown;");
  lines.push("  annotations?: Record<string, unknown>;");
  lines.push("  resultContent: McpResultContent;");
  lines.push("}");
  lines.push("");
  lines.push(`const tools: readonly GeneratedMcpTool[] = ${JSON.stringify(descriptor.tools, null, 2)};`);
  lines.push("");
  lines.push("export function createMcpServer(api: BoundApi) {");
  lines.push(`  const server = new McpServer({ name: ${JSON.stringify(descriptor.serverName)}, version: ${JSON.stringify(descriptor.serverVersion)} });`);
  lines.push("");
  lines.push("  for (const tool of tools) {");
  lines.push("    server.registerTool(");
  lines.push("      tool.name,");
  lines.push("      {");
  lines.push("        title: tool.title,");
  lines.push("        ...(tool.description === undefined ? {} : { description: tool.description }),");
  lines.push("        inputSchema: tool.inputSchema,");
  lines.push("        ...(tool.outputSchema === undefined ? {} : { outputSchema: tool.outputSchema }),");
  lines.push("        ...(tool.annotations === undefined ? {} : { annotations: tool.annotations })");
  lines.push("      },");
  lines.push("      async (args: unknown) => {");
  lines.push("        try {");
  lines.push("          const result = await invokeOperation(api, tool.operationId, args);");
  lines.push("          return toMcpToolResult(result, tool.resultContent);");
  lines.push("        } catch (error) {");
  lines.push("          return {");
  lines.push("            content: [{ type: \"text\", text: errorMessage(error) }],");
  lines.push("            isError: true");
  lines.push("          };");
  lines.push("        }");
  lines.push("      }");
  lines.push("    );");
  lines.push("  }");
  lines.push("");
  lines.push("  return server;");
  lines.push("}");
  lines.push("");
  lines.push("export async function main(api: BoundApi) {");
  lines.push("  const server = createMcpServer(api);");
  lines.push("  const transport = new StdioServerTransport();");
  lines.push("  await server.connect(transport);");
  lines.push("}");
  lines.push("");
  lines.push("function toMcpToolResult(value: unknown, resultContent: McpResultContent) {");
  lines.push("  const text = typeof value === \"string\" ? value : JSON.stringify(value, null, 2);");
  lines.push("  if (resultContent === \"text\") {");
  lines.push("    return { content: [{ type: \"text\", text }] };");
  lines.push("  }");
  lines.push("  return {");
  lines.push("    content: [{ type: \"text\", text }],");
  lines.push("    structuredContent: value");
  lines.push("  };");
  lines.push("}");
  lines.push("");
  lines.push("function errorMessage(error: unknown): string {");
  lines.push("  return error instanceof Error ? error.message : String(error);");
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

export function generateTypeScriptClient(contract: ApiContract, options: TypeScriptClientOptions = {}): string {
  const clientName = options.clientName ?? "apiClient";
  const importPath = options.importPath ?? "@async/api-contract";
  const operationIds = contract.operations.map((operation) => operation.id);
  const lines: string[] = [];
  lines.push(`import { invokeOperation } from "${importPath}";`);
  lines.push(`import type { BoundApi } from "${importPath}/interface";`);
  lines.push("");
  lines.push(`export const operationIds = ${JSON.stringify(operationIds, null, 2)} as const;`);
  lines.push("export type OperationId = typeof operationIds[number];");
  lines.push("");
  lines.push(`export function ${clientName}(api: BoundApi) {`);
  lines.push("  return {");
  for (const operation of contract.operations) {
    lines.push(`    ${JSON.stringify(operation.id)}: (input: unknown) => invokeOperation(api, ${JSON.stringify(operation.id)}, input),`);
  }
  lines.push("  };");
  lines.push("}");
  lines.push("");
  return `${lines.join("\n")}`;
}

export function packageManifestForContract(contract: ApiContract, options: GenerateManifestOptions = {}): PackageContractManifest {
  return generatePackageManifest(contract, options);
}

function mcpOperations(
  contract: ApiContract,
  exposure: McpExposure
): Array<{ operation: OperationSpec; projection: McpProjection | undefined }> {
  const out: Array<{ operation: OperationSpec; projection: McpProjection | undefined }> = [];
  for (const operation of contract.operations) {
    const projection = mcpProjectionForOperation(contract, operation);
    if (projection?.enabled === false) continue;
    if (exposure === "explicit" && projection === undefined) continue;
    out.push({ operation, projection });
  }
  return out;
}

function mcpProjectionForOperation(contract: ApiContract, operation: OperationSpec): McpProjection | undefined {
  const setProjection = contract.projections?.mcp?.find((projection) => projection.operationId === operation.id);
  if (!setProjection && !operation.mcp) return undefined;
  return {
    ...(setProjection ?? {}),
    ...(operation.mcp ?? {})
  };
}

function mcpToolName(operation: OperationSpec, projection: McpProjection | undefined): string {
  const toolName = projection?.toolName ?? operation.id;
  if (isMcpSafeToolName(toolName)) return toolName;
  if (projection?.toolName) {
    throw new Error(`MCP toolName for operation ${operation.id} must use 1-128 ASCII letters, numbers, underscore, hyphen, or dot characters.`);
  }
  throw new Error(`MCP toolName is required for operation ${operation.id} because the operation id is not MCP-safe.`);
}

function isMcpSafeToolName(value: string): boolean {
  return /^[A-Za-z0-9_.-]{1,128}$/.test(value);
}

function emptyObjectSchema(): unknown {
  return {
    type: "object",
    additionalProperties: false
  };
}

function packageNameWithoutScope(packageName: string): string {
  return packageName.split("/").pop() ?? packageName;
}
