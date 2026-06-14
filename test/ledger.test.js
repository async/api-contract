import assert from 'node:assert/strict';
import test from 'node:test';
import { createSurface, parsePackageContractManifest, renderApiSurfaceMarkdown } from '../dist/index.js';

test('renderApiSurfaceMarkdown emits deterministic feature and surface sections', () => {
  const surface = createSurface({ contractId: 'demo', features: ['feature.b', 'feature.a'] });
  const manifest = parsePackageContractManifest({
    format: 'api-contract.package.v1',
    packageName: '@async/demo',
    catalogs: [{
      format: 'api-contract.catalog.v1',
      contractId: 'demo',
      title: 'Demo Contract',
      features: [
        { id: 'feature.b', title: 'B', releaseTag: 'beta', stability: 'preview', group: 'runtime' },
        { id: 'feature.a', title: 'A', releaseTag: 'public', stability: 'stable', group: 'runtime' }
      ]
    }],
    supported: [{ format: 'api-contract.surface.v1', contractId: 'demo', features: ['feature.b', 'feature.a'], hash: surface.hash }]
  });

  const markdown = renderApiSurfaceMarkdown({ manifest });
  assert.match(markdown, /^# @async\/demo API Surface Ledger/);
  assert.match(markdown, /### Runtime/);
  assert.match(markdown, /`feature\.a` \| A \| public \| stable/);
  assert.match(markdown, /## Supported Surfaces/);
  assert.match(markdown, new RegExp(surface.hash));
});
