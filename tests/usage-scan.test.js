import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { defineFeatureCatalog, scanUsageTarget } from '../dist/index.js';

test('scanUsageTarget records feature and import evidence', () => {
  const dir = mkdtempSync(join(tmpdir(), 'api-contract-usage-'));
  writeFileSync(join(dir, 'example.ts'), "import '@async/pipeline';\nconst feature = 'step.shell';\n");
  const catalog = defineFeatureCatalog({
    format: 'api-contract.catalog.v1',
    contractId: '@async/pipeline.declaration',
    features: [{ id: 'step.shell', title: 'Shell', releaseTag: 'public' }]
  });
  const usage = scanUsageTarget({ target: dir, packageName: '@async/consumer', dependencyName: '@async/pipeline', catalog });
  assert.deepEqual(usage.surface.features, ['step.shell']);
  assert.equal(usage.locations.length, 2);
});
