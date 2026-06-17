import type { FeatureSpec, RenderLedgerInput, Surface } from "./model.js";
import type { SerializedApiInterface, SerializedOperationSpec } from "./interface.js";

export function renderApiSurfaceMarkdown(input: RenderLedgerInput): string {
  const manifest = input.manifest;
  const lines: string[] = [];
  lines.push(`# ${input.title ?? `${manifest.packageName} API Surface Ledger`}`);
  lines.push("");
  lines.push(input.reviewRule ?? "This file is the generated review ledger for semantic API contract features. It is current-state contract documentation, not a changelog or tutorial.");
  lines.push("");

  for (const catalog of manifest.catalogs ?? []) {
    lines.push(`## ${catalog.title ?? catalog.contractId}`);
    lines.push("");
    lines.push(`Contract: \`${catalog.contractId}\``);
    lines.push("");

    const grouped = groupFeatures(catalog.features);
    for (const [group, features] of grouped) {
      lines.push(`### ${titleCase(group)}`);
      lines.push("");
      lines.push("| Feature | Title | Release | Stability | Lifecycle | Replacement | Docs |");
      lines.push("| --- | --- | --- | --- | --- | --- | --- |");
      for (const feature of features) {
        lines.push(`| \`${escapeCell(feature.id)}\` | ${escapeCell(feature.title)} | ${feature.releaseTag} | ${feature.stability ?? ""} | ${feature.lifecycle ?? "active"} | ${feature.replacedBy ? `\`${escapeCell(feature.replacedBy)}\`` : ""} | ${feature.docsUrl ? `[docs](${feature.docsUrl})` : ""} |`);
      }
      lines.push("");
    }
  }

  pushSurfaceSection(lines, "Supported Surfaces", manifest.supported ?? []);
  pushSurfaceSection(lines, "Required Surfaces", manifest.required ?? []);
  pushSurfaceSection(lines, "Emitted Surfaces", manifest.emits ?? []);
  pushOperationSection(lines, readSerializedInterface(manifest["x-interface"]));
  pushLifecycleSummary(lines, manifest.catalogs?.flatMap((catalog) => [...catalog.features]) ?? []);

  return `${lines.join("\n").trimEnd()}\n`;
}

function pushOperationSection(lines: string[], apiInterface: SerializedApiInterface | undefined): void {
  if (!apiInterface || apiInterface.operations.length === 0) return;
  lines.push("## Operations");
  lines.push("");
  lines.push(`Interface: \`${escapeCell(apiInterface.contractId)}\``);
  lines.push("");
  lines.push("| Operation | Feature | Title | Release | Lifecycle | Effects | CLI | Dashboard | Docs |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const operation of [...apiInterface.operations].sort((a, b) => a.id.localeCompare(b.id))) {
    lines.push(`| \`${escapeCell(operation.id)}\` | \`${escapeCell(operation.featureId)}\` | ${escapeCell(operation.title)} | ${operation.releaseTag} | ${operation.lifecycle} | ${formatList(operation.effects ?? [])} | ${formatCli(operation)} | ${formatDashboard(operation)} | ${formatList(operation.docs ?? [])} |`);
  }
  lines.push("");
}

function groupFeatures(features: readonly FeatureSpec[]): Array<[string, FeatureSpec[]]> {
  const groups = new Map<string, FeatureSpec[]>();
  for (const feature of features) {
    const group = feature.group ?? "features";
    const current = groups.get(group) ?? [];
    current.push(feature);
    groups.set(group, current);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, entries]) => [group, entries.sort((a, b) => a.id.localeCompare(b.id))]);
}

function pushSurfaceSection(lines: string[], title: string, surfaces: readonly Surface[]): void {
  if (surfaces.length === 0) return;
  lines.push(`## ${title}`);
  lines.push("");
  lines.push("| Contract | Hash | Features |");
  lines.push("| --- | --- | --- |");
  for (const surface of [...surfaces].sort((a, b) => a.contractId.localeCompare(b.contractId))) {
    lines.push(`| \`${escapeCell(surface.contractId)}\` | \`${surface.hash}\` | ${surface.features.map((feature) => `\`${escapeCell(feature)}\``).join(", ")} |`);
  }
  lines.push("");
}

function pushLifecycleSummary(lines: string[], features: readonly FeatureSpec[]): void {
  const tracked = features.filter((feature) => feature.lifecycle === "deprecated" || feature.lifecycle === "removed");
  if (tracked.length === 0) return;
  lines.push("## Deprecated And Removed Features");
  lines.push("");
  lines.push("| Feature | Lifecycle | Since | Replacement |");
  lines.push("| --- | --- | --- | --- |");
  for (const feature of tracked.sort((a, b) => a.id.localeCompare(b.id))) {
    lines.push(`| \`${escapeCell(feature.id)}\` | ${feature.lifecycle ?? "active"} | ${feature.deprecatedSince ?? feature.removedSince ?? ""} | ${feature.replacedBy ? `\`${escapeCell(feature.replacedBy)}\`` : ""} |`);
  }
  lines.push("");
}

function titleCase(value: string): string {
  return value
    .split(/[._ -]+/g)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|");
}

function readSerializedInterface(value: unknown): SerializedApiInterface | undefined {
  if (!isObject(value)) return undefined;
  if (value.format !== "api-contract.interface.v1") return undefined;
  if (typeof value.contractId !== "string") return undefined;
  if (!Array.isArray(value.operations)) return undefined;
  return value as unknown as SerializedApiInterface;
}

function formatList(values: readonly string[]): string {
  return values.map((value) => `\`${escapeCell(value)}\``).join(", ");
}

function formatCli(operation: SerializedOperationSpec): string {
  const command = operation.cli?.command;
  if (Array.isArray(command)) return `\`${command.map(escapeCell).join(" ")}\``;
  if (typeof command === "string") return `\`${escapeCell(command)}\``;
  return "";
}

function formatDashboard(operation: SerializedOperationSpec): string {
  const group = operation.dashboard?.group;
  const view = operation.dashboard?.view;
  if (group && view) return `${escapeCell(group)} / ${escapeCell(view)}`;
  if (group) return escapeCell(group);
  if (view) return escapeCell(view);
  return "";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
