import type {
  CliProjection,
  DashboardProjection,
  ProjectionSet
} from "./interface.js";

export {
  type CliArgumentSpec,
  type CliFlagSpec,
  type CliProjection,
  type DashboardProjection,
  type ProjectionSet
} from "./interface.js";

export function defineCliProjection(input: CliProjection): CliProjection {
  return { ...input };
}

export function defineDashboardProjection(input: DashboardProjection): DashboardProjection {
  return { ...input };
}

export function defineProjectionSet(input: ProjectionSet): ProjectionSet {
  return {
    ...input,
    ...(input.cli === undefined ? {} : { cli: [...input.cli].map(defineCliProjection) }),
    ...(input.dashboard === undefined ? {} : { dashboard: [...input.dashboard].map(defineDashboardProjection) })
  };
}
