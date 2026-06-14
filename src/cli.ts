#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { parsePackageContractManifest } from "./manifest.js";
import { renderApiSurfaceMarkdown } from "./ledger.js";
import { diffPackageContracts } from "./diff.js";
import { createImpactReport } from "./impact.js";
import { scanUsageTarget } from "./usage-scan.js";
import type { PackageContractManifest } from "./model.js";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function argValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function readManifest(path: string): PackageContractManifest {
  return parsePackageContractManifest(readJson(path));
}

function writeJsonOrStdout(value: unknown, outPath: string | undefined): void {
  const text = `${JSON.stringify(value, null, 2)}
`;
  if (outPath) writeFileSync(outPath, text);
  else process.stdout.write(text);
}

function readConsumers(path: string): PackageContractManifest[] {
  const value = readJson(path);
  if (Array.isArray(value)) return value.map(parsePackageContractManifest);
  if (typeof value === "object" && value !== null && Array.isArray((value as { manifests?: unknown }).manifests)) {
    return (value as { manifests: unknown[] }).manifests.map(parsePackageContractManifest);
  }
  return [parsePackageContractManifest(value)];
}

const args = process.argv.slice(2);
const command = args[0];

try {
  if (command === "check") {
    const manifestPath = argValue(args, "--manifest");
    if (!manifestPath) throw new Error("Missing --manifest <file>");
    parsePackageContractManifest(readJson(manifestPath));
    console.log(`ok ${manifestPath}`);
  } else if (command === "ledger") {
    const manifestPath = argValue(args, "--manifest");
    if (!manifestPath) throw new Error("Missing --manifest <file>");
    const manifest = readManifest(manifestPath);
    const markdown = renderApiSurfaceMarkdown({ manifest });
    const checkPath = argValue(args, "--check");
    if (checkPath) {
      const existing = readFileSync(checkPath, "utf8");
      if (existing !== markdown) throw new Error(`${checkPath} is out of date`);
      console.log(`ok ${checkPath}`);
    } else {
      const outPath = argValue(args, "--out");
      if (outPath) writeFileSync(outPath, markdown);
      else process.stdout.write(markdown);
    }
  } else if (command === "diff") {
    const beforePath = argValue(args, "--before");
    const afterPath = argValue(args, "--after");
    if (!beforePath || !afterPath) throw new Error("Missing --before <file> or --after <file>");
    writeJsonOrStdout(diffPackageContracts(readManifest(beforePath), readManifest(afterPath)), argValue(args, "--out"));
  } else if (command === "impact") {
    const beforePath = argValue(args, "--before");
    const afterPath = argValue(args, "--after");
    const consumersPath = argValue(args, "--consumers");
    if (!beforePath || !afterPath || !consumersPath) throw new Error("Missing --before <file>, --after <file>, or --consumers <file>");
    writeJsonOrStdout(createImpactReport({ before: readManifest(beforePath), after: readManifest(afterPath), consumers: readConsumers(consumersPath) }), argValue(args, "--out"));
  } else if (command === "usage" && args[1] === "scan") {
    const target = argValue(args, "--target");
    const dependencyName = argValue(args, "--dependency");
    const catalogPath = argValue(args, "--catalog");
    const packageName = argValue(args, "--package-name") ?? "unknown";
    if (!target || !dependencyName || !catalogPath) throw new Error("Missing --target <path>, --dependency <name>, or --catalog <manifest>");
    const manifest = readManifest(catalogPath);
    const catalog = manifest.catalogs?.[0];
    if (!catalog) throw new Error(`${catalogPath} does not contain a catalog`);
    writeJsonOrStdout({
      format: "api-contract.package.v1",
      packageName,
      usage: [scanUsageTarget({ target, dependencyName, packageName, catalog })]
    }, argValue(args, "--out"));
  } else {
    throw new Error("Usage: api-contract check|ledger|diff|impact|usage scan");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
