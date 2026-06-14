import assert from 'node:assert/strict';
import test from 'node:test';
import { defineFeatureCatalog, deriveSurface } from '../dist/index.js';

const catalog = defineFeatureCatalog({
  format: 'api-contract.catalog.v1',
  contractId: '@async/pipeline.declaration',
  features: [
    { id: 'task.run', title: 'Task', releaseTag: 'public' },
    { id: 'step.shell', title: 'Shell step', releaseTag: 'public' }
  ]
});

test('deriveSurface walks nested values and handles cycles', () => {
  const root = { kind: 'task', child: { kind: 'step', shell: 'pnpm test' } };
  root.self = root;
  const surface = deriveSurface(root, {
    contractId: '@async/pipeline.declaration',
    catalog,
    strictCatalog: true,
    rules: [{
      name: 'pipeline',
      visit(value, context) {
        if (!value || typeof value !== 'object') return;
        if (value.kind === 'task') context.add('task.run');
        if (value.kind === 'step' && value.shell) context.add('step.shell');
      }
    }]
  });
  assert.deepEqual(surface.features, ['step.shell', 'task.run']);
});

test('strict catalog rejects unknown features', () => {
  assert.throws(() => deriveSurface({ kind: 'unknown' }, {
    contractId: '@async/pipeline.declaration',
    catalog,
    strictCatalog: true,
    rules: [{ name: 'bad', visit(_value, context) { context.add('missing.feature'); } }]
  }), /Unknown feature/);
});
