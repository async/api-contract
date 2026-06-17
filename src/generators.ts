import { renderApiSurfaceMarkdown } from "./ledger.js";
import {
  generateCliDescriptor,
  generateDashboardManifest,
  generatePackageManifest,
  renderInterfaceMarkdown
} from "./interface.js";
import type {
  ApiContract,
  CliCommandDescriptor,
  CliDescriptor,
  DashboardManifest,
  DashboardOperationDescriptor,
  GenerateManifestOptions
} from "./interface.js";
import type { PackageContractManifest, RenderLedgerInput } from "./model.js";

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
