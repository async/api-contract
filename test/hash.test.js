import assert from 'node:assert/strict';
import test from 'node:test';
import { createSurface, surfaceHash } from '../dist/index.js';

test('surface hash sorts and deduplicates features', () => {
  const a = createSurface({ contractId: 'demo', features: ['b', 'a', 'a'] });
  const b = createSurface({ contractId: 'demo', features: ['a', 'b'] });
  assert.deepEqual(a.features, ['a', 'b']);
  assert.equal(a.hash, b.hash);
  assert.equal(surfaceHash({ contractId: 'demo', features: ['b', 'a'] }), a.hash);
});

test('surface hash ignores metadata', () => {
  const a = createSurface({ contractId: 'demo', features: ['a'], meta: { docs: 'one' } });
  const b = createSurface({ contractId: 'demo', features: ['a'], meta: { docs: 'two' } });
  assert.equal(a.hash, b.hash);
});
