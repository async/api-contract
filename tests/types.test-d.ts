import type {
  AssertCompatible,
  Expect,
  RequiresContract,
  SupportsContract
} from "@async/api-contract/types";
import type {
  ApiContract,
  ApiHandlersFor,
  InferOperationInput,
  InferOperationOutput,
  OperationSpec
} from "@async/api-contract/interface";
import type { SchemaMetadata } from "@async/api-contract/schema";
import type { ProjectionSet } from "@async/api-contract/projection";
import type {
  CliDescriptor as GeneratorCliDescriptor,
  MachineCliRouterDescriptor
} from "@async/api-contract/generators";

type LoosePipelineRequirement = RequiresContract<"@async/pipeline.declaration">;
type ShellStepRequirement = RequiresContract<"@async/pipeline.declaration", "task.run" | "step.shell">;
type HostSupport = SupportsContract<"@async/pipeline.declaration", "task.run" | "step.shell" | "agent.stdoutTo">;

type ExactCheck = Expect<AssertCompatible<ShellStepRequirement, HostSupport>>;
type ForwardCompatibleLooseCheck = Expect<AssertCompatible<LoosePipelineRequirement, HostSupport>>;

type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;

type InitOperation = OperationSpec<{ name: string }, { ok: boolean }>;
type OperationInputCheck = Expect<IsEqual<InferOperationInput<InitOperation>, { name: string }>>;
type OperationOutputCheck = Expect<IsEqual<InferOperationOutput<InitOperation>, { ok: boolean }>>;
type LiteralInitOperation = OperationSpec<{ name: string }, { ok: boolean }, "project.init">;
type LiteralContract = ApiContract<readonly [LiteralInitOperation]>;
type LiteralHandlers = ApiHandlersFor<LiteralContract["operations"]>;
type HandlerInputCheck = Expect<IsEqual<Parameters<LiteralHandlers["project.init"]>[0], { name: string }>>;
type HandlerOutputCheck = Expect<IsEqual<Awaited<ReturnType<LiteralHandlers["project.init"]>>, { ok: boolean }>>;
type GeneratorExportCheck = Expect<IsEqual<GeneratorCliDescriptor["format"], "api-contract.cli.v1">>;
type MachineRouterExportCheck = Expect<IsEqual<MachineCliRouterDescriptor["format"], "api-contract.machine-cli-router.v1">>;
type SchemaExportCheck = Expect<IsEqual<SchemaMetadata["id"], string>>;
type ProjectionExportCheck = Expect<IsEqual<ProjectionSet["cli"], ProjectionSet["cli"]>>;

export type TypeContractSmoke =
  | ExactCheck
  | ForwardCompatibleLooseCheck
  | OperationInputCheck
  | OperationOutputCheck
  | HandlerInputCheck
  | HandlerOutputCheck
  | GeneratorExportCheck
  | MachineRouterExportCheck
  | SchemaExportCheck
  | ProjectionExportCheck;
