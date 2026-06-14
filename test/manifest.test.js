import assert from 'node:assert/strict';
import test from 'node:test';
import { createSurface, parsePackageContractManifest } from '../dist/index.js';

test('parsePackageContractManifest normalizes surfaces and catalogs', () => {
  const supported = createSurface({ contractId: 'demo', features: ['b', 'a'] });
  const manifest = parsePackageContractManifest({
    format: 'api-contract.package.v1',
    packageName: '@async/demo',
    catalogs: [{
      format: 'api-contract.catalog.v1',
      contractId: 'demo',
      features: [{ id: 'a', title: 'A', releaseTag: 'public' }]
    }],
    supported: [{
      format: 'api-contract.surface.v1',
      contractId: 'demo',
      features: ['b', 'a'],
      hash: supported.hash
    }]
  });
  assert.equal(manifest.packageName, '@async/demo');
  assert.deepEqual(manifest.supported[0].features, ['a', 'b']);
});

test('parsePackageContractManifest rejects hash mismatch', () => {
  assert.throws(() => parsePackageContractManifest({
    format: 'api-contract.package.v1',
    packageName: '@async/demo',
    supported: [{ format: 'api-contract.surface.v1', contractId: 'demo', features: ['a'], hash: 'sha256:bad' }]
  }), /hash mismatch/);
});
