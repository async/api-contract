import assert from 'node:assert/strict';
import test from 'node:test';
import { diffPackageContracts, parsePackageContractManifest } from '../dist/index.js';

test('diffPackageContracts reports added removed and deprecated features', () => {
  const before = parsePackageContractManifest({
    format: 'api-contract.package.v1',
    packageName: '@async/provider',
    catalogs: [{ format: 'api-contract.catalog.v1', contractId: 'demo', features: [
      { id: 'old.feature', title: 'Old', releaseTag: 'public' }
    ] }]
  });
  const after = parsePackageContractManifest({
    format: 'api-contract.package.v1',
    packageName: '@async/provider',
    catalogs: [{ format: 'api-contract.catalog.v1', contractId: 'demo', features: [
      { id: 'new.feature', title: 'New', releaseTag: 'public' },
      { id: 'kept.feature', title: 'Kept', releaseTag: 'public', lifecycle: 'deprecated' }
    ] }]
  });
  const diff = diffPackageContracts(before, after);
  assert.deepEqual(diff.removedFeatures, ['old.feature']);
  assert.deepEqual(diff.addedFeatures, ['kept.feature', 'new.feature']);
  assert.deepEqual(diff.deprecatedFeatures, ['kept.feature']);
});
