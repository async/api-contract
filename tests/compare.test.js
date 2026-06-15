import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compareContractSets,
  compareSurface,
  createContractSet,
  createSurface,
  defineFeatureCatalog
} from '../dist/index.js';

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

test('catalog policy can warn on deprecated required features', () => {
  const catalog = defineFeatureCatalog({
    format: 'api-contract.catalog.v1',
    contractId: 'demo',
    features: [
      { id: 'user.id', title: 'User id field', releaseTag: 'public' },
      { id: 'user.email', title: 'User email field', releaseTag: 'public', lifecycle: 'deprecated' }
    ]
  });
  const required = createSurface({ contractId: 'demo', features: ['user.id', 'user.email'] });
  const supported = createSurface({ contractId: 'demo', features: ['user.id', 'user.email'] });

  const result = compareSurface(required, supported, { catalog, deprecated: 'warn' });

  assert.equal(result.ok, true);
  assert.match(result.warnings.join('\n'), /user\.email is deprecated/);
});

test('catalog policy can fail disallowed release tags and unknown features', () => {
  const catalog = defineFeatureCatalog({
    format: 'api-contract.catalog.v1',
    contractId: 'demo',
    features: [
      { id: 'user.id', title: 'User id field', releaseTag: 'public' },
      { id: 'user.email', title: 'User email field', releaseTag: 'beta' }
    ]
  });
  const required = createSurface({ contractId: 'demo', features: ['user.id', 'user.email', 'user.name'] });
  const supported = createSurface({ contractId: 'demo', features: ['user.id', 'user.email', 'user.name'] });

  const surfaceResult = compareSurface(required, supported, {
    catalog,
    allowedReleaseTags: ['public'],
    unknownFeatures: 'error'
  });
  const setResult = compareContractSets(createContractSet([required]), createContractSet([supported]), {
    catalog,
    allowedReleaseTags: ['public'],
    unknownFeatures: 'error'
  });

  assert.equal(surfaceResult.ok, false);
  assert.match(surfaceResult.warnings.join('\n'), /user\.email has release tag beta/);
  assert.match(surfaceResult.warnings.join('\n'), /Unknown feature in demo: user\.name/);
  assert.equal(setResult.ok, false);
});
