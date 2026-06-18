import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const combinationsRoot = join(repoRoot, "examples", "combinations");

for (const entry of readdirSync(combinationsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const examplePath = join(combinationsRoot, entry.name, "example.js");
  if (!existsSync(examplePath)) continue;
  const readmePath = join(combinationsRoot, entry.name, "README.md");

  test(`combination example is documented: ${entry.name}`, () => {
    assert.equal(existsSync(readmePath), true);
    const readme = readFileSync(readmePath, "utf8");
    assert.match(readme, /^# /);
    assert.match(readme, /Combination:/);
    assert.match(readme, /Why you want this combination:/);
    assert.match(readme, /Run:/);
  });

  test(`combination example runs: ${entry.name}`, () => {
    const result = spawnSync(process.execPath, [examplePath], {
      cwd: repoRoot,
      encoding: "utf8"
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /\S/);
  });
}
