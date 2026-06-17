import { defineFeatureCatalog } from "./catalog.js";
import { createSurface } from "./surface.js";
import type {
  ExtensionFields,
  FeatureCatalog,
  FeatureLifecycle,
  PackageContractManifest,
  ReleaseTag,
  StabilityLabel,
  Surface
} from "./model.js";

export const apiInterfaceFormat = "api-contract.interface.v1";

export type OperationId = string;
export type OperationEffect =
  | "filesystem.read"
  | "filesystem.write"
  | "process.spawn"
  | "network.request"
  | "agent.run"
  | "browser.verify"
  | "git.write"
  | "package.install"
  | (string & {});

export interface SchemaDescription extends ExtensionFields {
  title?: string;
  description?: string;
  type?: string;
  properties?: Record<string, unknown>;
  required?: readonly string[];
  enum?: readonly unknown[];
}

export interface SchemaAdapter<T = unknown> {
  parse(value: unknown): T;
  jsonSchema(): unknown;
  defaults?(): Partial<T>;
  examples?(): readonly T[];
  describe?(): SchemaDescription;
}

export interface JsonSchemaAdapterOptions<T> {
  parse?(value: unknown): T;
  defaults?(): Partial<T>;
  examples?(): readonly T[];
  describe?(): SchemaDescription;
}

export interface DocSource extends ExtensionFields {
  id: string;
  title?: string;
  path?: string;
  url?: string;
  summary?: string;
  sections?: readonly DocSection[];
  sha256?: string;
}

export interface DocSection extends ExtensionFields {
  title?: string;
  anchor?: string;
  operations?: readonly OperationId[];
}

export interface OperationErrorSpec extends ExtensionFields {
  code: string;
  title?: string;
  message?: string;
  retryable?: boolean;
  exitCode?: number;
}

export interface ReceiptSpec extends ExtensionFields {
  kind: "receipt" | "report" | "transcript" | "verification" | (string & {});
  pathTemplate: string;
  required?: boolean;
}

export interface CliArgumentSpec extends ExtensionFields {
  name: string;
  description?: string;
  required?: boolean;
}

export interface CliFlagSpec extends ExtensionFields {
  name: string;
  description?: string;
  type?: "boolean" | "string" | "number" | "json";
  required?: boolean;
  default?: unknown;
}

export interface CliProjection extends ExtensionFields {
  command?: string | readonly string[];
  aliases?: readonly string[];
  interactive?: boolean;
  args?: readonly CliArgumentSpec[];
  flags?: readonly CliFlagSpec[];
  summary?: string;
}

export interface DashboardProjection extends ExtensionFields {
  group?: string;
  view?: "form" | "table" | "detail" | "summary" | (string & {});
  resultView?: "summary" | "table" | "detail" | "log" | (string & {});
  title?: string;
  description?: string;
  sort?: number;
  emptyState?: string;
}

export interface OperationSpec<TInput = unknown, TOutput = unknown, TId extends string = OperationId> extends ExtensionFields {
  id: TId;
  title: string;
  description?: string;
  featureId: string;
  group?: string;
  lifecycle: FeatureLifecycle;
  releaseTag: ReleaseTag;
  stability?: StabilityLabel;
  input?: SchemaAdapter<TInput>;
  output?: SchemaAdapter<TOutput>;
  effects?: readonly OperationEffect[];
  errors?: readonly OperationErrorSpec[];
  docs?: readonly string[];
  receipts?: readonly ReceiptSpec[];
  cli?: CliProjection;
  dashboard?: DashboardProjection;
}

export interface DefineOperationInput<TInput = unknown, TOutput = unknown, TId extends string = OperationId> extends ExtensionFields {
  id?: TId;
  title: string;
  description?: string;
  featureId?: string;
  group?: string;
  lifecycle?: FeatureLifecycle;
  releaseTag?: ReleaseTag;
  stability?: StabilityLabel;
  input?: SchemaAdapter<TInput>;
  output?: SchemaAdapter<TOutput>;
  effects?: readonly OperationEffect[];
  errors?: readonly OperationErrorSpec[];
  docs?: readonly string[];
  receipts?: readonly ReceiptSpec[];
  cli?: CliProjection;
  dashboard?: DashboardProjection;
}

export type OperationRecord = Record<string, DefineOperationInput<unknown, unknown> | OperationSpec<unknown, unknown>>;

export interface ApiContract<TOperations extends readonly OperationSpec[] = readonly OperationSpec[]> extends ExtensionFields {
  format: typeof apiInterfaceFormat;
  packageName: string;
  contractId: string;
  title?: string;
  docs?: readonly DocSource[];
  operations: TOperations;
}

export interface DefineApiContractInput extends ExtensionFields {
  packageName: string;
  contractId?: string;
  title?: string;
  docs?: readonly DocSource[];
  operations: readonly (DefineOperationInput | OperationSpec)[] | OperationRecord;
}

export interface SerializedSchema extends ExtensionFields {
  schema?: unknown;
  defaults?: unknown;
  examples?: readonly unknown[];
  description?: SchemaDescription;
}

export interface SerializedOperationSpec extends ExtensionFields {
  id: OperationId;
  title: string;
  featureId: string;
  lifecycle: FeatureLifecycle;
  releaseTag: ReleaseTag;
  description?: string;
  group?: string;
  stability?: StabilityLabel;
  input?: SerializedSchema;
  output?: SerializedSchema;
  effects?: readonly OperationEffect[];
  errors?: readonly OperationErrorSpec[];
  docs?: readonly string[];
  receipts?: readonly ReceiptSpec[];
  cli?: CliProjection;
  dashboard?: DashboardProjection;
}

export interface SerializedApiInterface extends ExtensionFields {
  format: typeof apiInterfaceFormat;
  packageName: string;
  contractId: string;
  title?: string;
  docs?: readonly DocSource[];
  operations: readonly SerializedOperationSpec[];
}

export interface GenerateManifestOptions {
  base?: Partial<PackageContractManifest>;
  includeOperationCatalog?: boolean;
  includeOperationSurface?: boolean;
}

export interface CliDescriptorOptions {
  binaryName?: string;
}

export interface CliDescriptor extends ExtensionFields {
  format: "api-contract.cli.v1";
  packageName: string;
  binaryName: string;
  commands: readonly CliCommandDescriptor[];
  machine: {
    manifest: readonly string[];
    operations: readonly string[];
    describe: readonly string[];
    invoke: readonly string[];
  };
}

export interface CliCommandDescriptor extends ExtensionFields {
  operationId: OperationId;
  featureId: string;
  command: readonly string[];
  title: string;
  description?: string;
  interactive: boolean;
  args: readonly CliArgumentSpec[];
  flags: readonly CliFlagSpec[];
  effects: readonly OperationEffect[];
  inputSchema?: unknown;
  outputSchema?: unknown;
  invoke: readonly string[];
}

export interface DashboardManifestOptions {
  title?: string;
  binaryName?: string;
}

export interface DashboardManifest extends ExtensionFields {
  format: "api-contract.dashboard.v1";
  packageName: string;
  title: string;
  operations: readonly DashboardOperationDescriptor[];
}

export interface DashboardOperationDescriptor extends ExtensionFields {
  id: OperationId;
  featureId: string;
  title: string;
  description?: string;
  group: string;
  view: string;
  resultView: string;
  sort: number;
  effects: readonly OperationEffect[];
  inputSchema?: unknown;
  outputSchema?: unknown;
  invoke: {
    transport: "cli";
    command: readonly string[];
  };
}

export interface OperationRuntimeContext<TContext = unknown> {
  contract: ApiContract;
  operation: OperationSpec;
  context?: TContext;
}

export type OperationHandler<TInput = unknown, TOutput = unknown, TContext = unknown> = (
  input: TInput,
  runtime: OperationRuntimeContext<TContext>
) => TOutput | Promise<TOutput>;

export type ApiHandlers<TContext = unknown> = Record<string, OperationHandler<unknown, unknown, TContext>>;
export type ApiHandlersFor<TOperations extends readonly OperationSpec[], TContext = unknown> = {
  [K in TOperations[number]["id"]]: OperationHandler<
    InferOperationInput<Extract<TOperations[number], { id: K }>>,
    InferOperationOutput<Extract<TOperations[number], { id: K }>>,
    TContext
  >;
};

export interface BoundApi<TContext = unknown, TOperations extends readonly OperationSpec[] = readonly OperationSpec[]> {
  contract: ApiContract<TOperations>;
  handlers: ApiHandlersFor<TOperations, TContext>;
  context?: TContext;
}

export type InferOperationInput<T> = T extends OperationSpec<infer TInput, unknown> ? TInput : never;
export type InferOperationOutput<T> = T extends OperationSpec<unknown, infer TOutput> ? TOutput : never;

export function defineJsonSchema<T = unknown>(schema: unknown, options: JsonSchemaAdapterOptions<T> = {}): SchemaAdapter<T> {
  return {
    parse: options.parse ?? ((value: unknown) => value as T),
    jsonSchema: () => schema,
    ...(options.defaults ? { defaults: options.defaults } : {}),
    ...(options.examples ? { examples: options.examples } : {}),
    ...(options.describe ? { describe: options.describe } : {})
  };
}

export function defineOperation<TInput = unknown, TOutput = unknown>(input: DefineOperationInput<TInput, TOutput>): OperationSpec<TInput, TOutput> {
  const id = input.id;
  if (!id) throw new Error("Operation.id must be a non-empty string");
  assertNonEmptyString(id, "Operation.id");
  assertNonEmptyString(input.title, `Operation.title for ${id}`);
  const featureId = input.featureId ?? `operation.${id}`;
  assertNonEmptyString(featureId, `Operation.featureId for ${id}`);

  return {
    ...copyExtensionFields(input),
    id,
    title: input.title,
    featureId,
    lifecycle: input.lifecycle ?? "active",
    releaseTag: input.releaseTag ?? "public",
    ...(input.description === undefined ? {} : { description: input.description }),
    ...(input.group === undefined ? {} : { group: input.group }),
    ...(input.stability === undefined ? {} : { stability: input.stability }),
    ...(input.input === undefined ? {} : { input: input.input }),
    ...(input.output === undefined ? {} : { output: input.output }),
    ...(input.effects === undefined ? {} : { effects: input.effects }),
    ...(input.errors === undefined ? {} : { errors: input.errors }),
    ...(input.docs === undefined ? {} : { docs: input.docs }),
    ...(input.receipts === undefined ? {} : { receipts: input.receipts }),
    ...(input.cli === undefined ? {} : { cli: input.cli }),
    ...(input.dashboard === undefined ? {} : { dashboard: input.dashboard })
  };
}

export function defineApiContract(input: DefineApiContractInput): ApiContract {
  assertNonEmptyString(input.packageName, "ApiContract.packageName");
  const contractId = input.contractId ?? `${input.packageName}.operations`;
  assertNonEmptyString(contractId, "ApiContract.contractId");
  const operations = normalizeOperations(input.operations);
  const seen = new Set<string>();
  for (const operation of operations) {
    if (seen.has(operation.id)) throw new Error(`Duplicate operation id: ${operation.id}`);
    seen.add(operation.id);
  }

  return {
    ...copyExtensionFields(input),
    format: apiInterfaceFormat,
    packageName: input.packageName,
    contractId,
    ...(input.title === undefined ? {} : { title: input.title }),
    ...(input.docs === undefined ? {} : { docs: input.docs }),
    operations: operations.sort((a, b) => a.id.localeCompare(b.id))
  };
}

export function createOperationSurface(contract: ApiContract, contractId = contract.contractId): Surface {
  return createSurface({
    contractId,
    features: contract.operations.map((operation) => operation.featureId)
  });
}

export function createOperationFeatureCatalog(contract: ApiContract, contractId = contract.contractId): FeatureCatalog {
  return defineFeatureCatalog({
    format: "api-contract.catalog.v1",
    contractId,
    title: contract.title ? `${contract.title} Operations` : `${contract.packageName} Operations`,
    features: contract.operations.map((operation) => ({
      id: operation.featureId,
      title: operation.title,
      releaseTag: operation.releaseTag,
      lifecycle: operation.lifecycle,
      ...(operation.stability === undefined ? {} : { stability: operation.stability }),
      ...(operation.description === undefined ? {} : { description: operation.description }),
      group: operation.group ?? operation.id.split(".")[0] ?? "operations"
    }))
  });
}

export function serializeApiInterface(contract: ApiContract): SerializedApiInterface {
  return {
    ...copyExtensionFields(contract),
    format: apiInterfaceFormat,
    packageName: contract.packageName,
    contractId: contract.contractId,
    ...(contract.title === undefined ? {} : { title: contract.title }),
    ...(contract.docs === undefined ? {} : { docs: contract.docs }),
    operations: contract.operations.map(serializeOperation)
  };
}

export function generatePackageManifest(contract: ApiContract, options: GenerateManifestOptions = {}): PackageContractManifest {
  const base = options.base ?? {};
  const includeOperationCatalog = options.includeOperationCatalog ?? true;
  const includeOperationSurface = options.includeOperationSurface ?? true;
  const catalogs = includeOperationCatalog
    ? [...(base.catalogs ?? []), createOperationFeatureCatalog(contract)]
    : base.catalogs;
  const supported = includeOperationSurface
    ? [...(base.supported ?? []), createOperationSurface(contract)]
    : base.supported;

  return {
    ...copyExtensionFields(base),
    format: "api-contract.package.v1",
    packageName: base.packageName ?? contract.packageName,
    ...(catalogs === undefined ? {} : { catalogs }),
    ...(base.required === undefined ? {} : { required: base.required }),
    ...(base.emits === undefined ? {} : { emits: base.emits }),
    ...(base.usage === undefined ? {} : { usage: base.usage }),
    ...(supported === undefined ? {} : { supported }),
    "x-interface": serializeApiInterface(contract)
  };
}

export function generateCliDescriptor(contract: ApiContract, options: CliDescriptorOptions = {}): CliDescriptor {
  const binaryName = options.binaryName ?? packageBinaryName(contract.packageName);
  return {
    format: "api-contract.cli.v1",
    packageName: contract.packageName,
    binaryName,
    machine: {
      manifest: [binaryName, "api", "manifest", "--json"],
      operations: [binaryName, "api", "operations", "--json"],
      describe: [binaryName, "api", "describe", "<operationId>", "--json"],
      invoke: [binaryName, "api", "invoke", "<operationId>", "--input-json", "<json>"]
    },
    commands: contract.operations.map((operation) => ({
      operationId: operation.id,
      featureId: operation.featureId,
      command: commandPath(operation),
      title: operation.title,
      ...(operation.description === undefined ? {} : { description: operation.description }),
      interactive: operation.cli?.interactive ?? false,
      args: operation.cli?.args ?? [],
      flags: operation.cli?.flags ?? [],
      effects: operation.effects ?? [],
      ...(operation.input === undefined ? {} : { inputSchema: operation.input.jsonSchema() }),
      ...(operation.output === undefined ? {} : { outputSchema: operation.output.jsonSchema() }),
      invoke: [binaryName, "api", "invoke", operation.id, "--input-json", "<json>"]
    }))
  };
}

export function generateDashboardManifest(contract: ApiContract, options: DashboardManifestOptions = {}): DashboardManifest {
  const binaryName = options.binaryName ?? packageBinaryName(contract.packageName);
  return {
    format: "api-contract.dashboard.v1",
    packageName: contract.packageName,
    title: options.title ?? contract.title ?? contract.packageName,
    operations: contract.operations.map((operation) => ({
      id: operation.id,
      featureId: operation.featureId,
      title: operation.dashboard?.title ?? operation.title,
      ...(operation.dashboard?.description ?? operation.description ? { description: operation.dashboard?.description ?? operation.description } : {}),
      group: operation.dashboard?.group ?? operation.group ?? "Operations",
      view: operation.dashboard?.view ?? "form",
      resultView: operation.dashboard?.resultView ?? "summary",
      sort: operation.dashboard?.sort ?? 0,
      effects: operation.effects ?? [],
      ...(operation.input === undefined ? {} : { inputSchema: operation.input.jsonSchema() }),
      ...(operation.output === undefined ? {} : { outputSchema: operation.output.jsonSchema() }),
      invoke: {
        transport: "cli",
        command: [binaryName, "api", "invoke", operation.id, "--input-json", "<json>"]
      }
    }))
  };
}

export function renderInterfaceMarkdown(contract: ApiContract): string {
  const lines: string[] = [];
  lines.push(`# ${contract.title ?? contract.packageName} Interface`);
  lines.push("");
  lines.push("This file describes callable operations that can project into programmatic APIs, CLIs, and local dashboards.");
  lines.push("");
  lines.push("| Operation | Feature | Title | Release | Lifecycle | Effects |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const operation of contract.operations) {
    lines.push(`| \`${escapeCell(operation.id)}\` | \`${escapeCell(operation.featureId)}\` | ${escapeCell(operation.title)} | ${operation.releaseTag} | ${operation.lifecycle} | ${(operation.effects ?? []).map((effect) => `\`${escapeCell(effect)}\``).join(", ")} |`);
  }
  lines.push("");
  return lines.join("\n");
}

export function bindApiHandlers<TOperations extends readonly OperationSpec[], TContext = unknown>(
  contract: ApiContract<TOperations>,
  handlers: ApiHandlersFor<TOperations, TContext>,
  options?: { context?: TContext }
): BoundApi<TContext, TOperations>;
export function bindApiHandlers<TContext = unknown>(
  contract: ApiContract,
  handlers: ApiHandlers<TContext>,
  options?: { context?: TContext }
): BoundApi<TContext>;
export function bindApiHandlers<TContext = unknown>(
  contract: ApiContract,
  handlers: ApiHandlers<TContext>,
  options: { context?: TContext } = {}
): BoundApi<TContext> {
  const operationIds = new Set(contract.operations.map((operation) => operation.id));
  for (const operation of contract.operations) {
    if (typeof handlers[operation.id] !== "function") {
      throw new Error(`Missing handler for operation ${operation.id}`);
    }
  }
  for (const id of Object.keys(handlers)) {
    if (!operationIds.has(id)) throw new Error(`Unknown operation handler: ${id}`);
  }
  return {
    contract,
    handlers,
    ...(options.context === undefined ? {} : { context: options.context })
  };
}

export async function invokeOperation<TOutput = unknown>(
  boundApi: BoundApi,
  operationId: OperationId,
  input: unknown
): Promise<TOutput> {
  const operation = boundApi.contract.operations.find((candidate) => candidate.id === operationId);
  if (!operation) throw new Error(`Unknown operation: ${operationId}`);
  const handler = boundApi.handlers[operationId];
  if (!handler) throw new Error(`Missing handler for operation ${operationId}`);
  const parsedInput = operation.input ? operation.input.parse(input) : input;
  const output = await handler(parsedInput, {
    contract: boundApi.contract,
    operation,
    ...(boundApi.context === undefined ? {} : { context: boundApi.context })
  });
  return (operation.output ? operation.output.parse(output) : output) as TOutput;
}

function normalizeOperations(operations: readonly (DefineOperationInput | OperationSpec)[] | OperationRecord): OperationSpec[] {
  if (Array.isArray(operations)) {
    return operations.map((operation) => defineOperation(operation));
  }
  return Object.entries(operations).map(([id, operation]) => defineOperation({
    ...operation,
    id: operation.id ?? id
  }));
}

function serializeOperation(operation: OperationSpec): SerializedOperationSpec {
  return {
    ...copyExtensionFields(operation),
    id: operation.id,
    title: operation.title,
    featureId: operation.featureId,
    lifecycle: operation.lifecycle,
    releaseTag: operation.releaseTag,
    ...(operation.description === undefined ? {} : { description: operation.description }),
    ...(operation.group === undefined ? {} : { group: operation.group }),
    ...(operation.stability === undefined ? {} : { stability: operation.stability }),
    ...(operation.input === undefined ? {} : { input: serializeSchema(operation.input) }),
    ...(operation.output === undefined ? {} : { output: serializeSchema(operation.output) }),
    ...(operation.effects === undefined ? {} : { effects: operation.effects }),
    ...(operation.errors === undefined ? {} : { errors: operation.errors }),
    ...(operation.docs === undefined ? {} : { docs: operation.docs }),
    ...(operation.receipts === undefined ? {} : { receipts: operation.receipts }),
    ...(operation.cli === undefined ? {} : { cli: operation.cli }),
    ...(operation.dashboard === undefined ? {} : { dashboard: operation.dashboard })
  };
}

function serializeSchema(schema: SchemaAdapter): SerializedSchema {
  return {
    schema: schema.jsonSchema(),
    ...(schema.defaults === undefined ? {} : { defaults: schema.defaults() }),
    ...(schema.examples === undefined ? {} : { examples: schema.examples() }),
    ...(schema.describe === undefined ? {} : { description: schema.describe() })
  };
}

function commandPath(operation: OperationSpec): readonly string[] {
  if (Array.isArray(operation.cli?.command)) return operation.cli.command;
  if (typeof operation.cli?.command === "string") return splitCommand(operation.cli.command);
  return operation.id.split(".");
}

function splitCommand(command: string): readonly string[] {
  return command.split(/\s+/g).filter(Boolean);
}

function packageBinaryName(packageName: string): string {
  return packageName.split("/").pop() ?? packageName;
}

function assertNonEmptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function copyExtensionFields(value: object): Record<`x-${string}`, unknown> {
  const out: Record<`x-${string}`, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key.startsWith("x-")) out[key as `x-${string}`] = entry;
  }
  return out;
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|");
}
