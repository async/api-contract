import type {
  AssertCompatible,
  Expect,
  RequiresContract,
  SupportsContract
} from "@async/api-contract/types";

type LoosePipelineRequirement = RequiresContract<"@async/pipeline.declaration">;
type ShellStepRequirement = RequiresContract<"@async/pipeline.declaration", "task.run" | "step.shell">;
type HostSupport = SupportsContract<"@async/pipeline.declaration", "task.run" | "step.shell" | "agent.stdoutTo">;

type ExactCheck = Expect<AssertCompatible<ShellStepRequirement, HostSupport>>;
type ForwardCompatibleLooseCheck = Expect<AssertCompatible<LoosePipelineRequirement, HostSupport>>;

export type TypeContractSmoke = ExactCheck | ForwardCompatibleLooseCheck;
