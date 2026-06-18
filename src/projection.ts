import type {
  CliProjection,
  DashboardProjection,
  McpProjection,
  ProjectionSet
} from "./interface.js";

export {
  type CliArgumentSpec,
  type CliFlagSpec,
  type CliProjection,
  type DashboardProjection,
  type McpProjection,
  type McpResultContent,
  type ProjectionSet
} from "./interface.js";

export function defineCliProjection(input: CliProjection): CliProjection {
  return { ...input };
}

export function defineDashboardProjection(input: DashboardProjection): DashboardProjection {
  return { ...input };
}

export function defineMcpProjection(input: McpProjection): McpProjection {
  return { ...input };
}

export function defineProjectionSet(input: ProjectionSet): ProjectionSet {
  return {
    ...input,
    ...(input.cli === undefined ? {} : { cli: [...input.cli].map(defineCliProjection) }),
    ...(input.dashboard === undefined ? {} : { dashboard: [...input.dashboard].map(defineDashboardProjection) }),
    ...(input.mcp === undefined ? {} : { mcp: [...input.mcp].map(defineMcpProjection) })
  };
}
