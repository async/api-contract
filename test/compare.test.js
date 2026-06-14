import assert from 'node:assert/strict';
import test from 'node:test';
import { compareSurface, createSurface } from '../dist/index.js';

test('required subset is compatible', () => {
  const required = createSurface({ contractId: 'demo', features: ['task.run'] });
  const supported = createSurface({ contractId: 'demo', features: ['task.run', 'step.shell'] });
  assert.equal(compareSurface(required, supported).ok, true);
});

test('missing required feature is incompatible', () => {
  const required = createSurface({ contractId: 'demo', features: ['task.run', 'step.shell'] });
  const supported = createSurface({ contractId: 'demo', features: ['task.run'] });
  const result = compareSurface(required, supported);
  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, ['step.shell']);
});
