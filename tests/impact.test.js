import assert from 'node:assert/strict';
import test from 'node:test';
import { createImpactReport, createSurface, parsePackageContractManifest } from '../dist/index.js';

test('createImpactReport flags consumers using removed features', () => {
  const before = parsePackageContractManifest({
    format: 'api-contract.package.v1',
    packageName: '@async/pipeline',
    catalogs: [{ format: 'api-contract.catalog.v1', contractId: '@async/pipeline.declaration', features: [
      { id: 'task.run', title: 'Task', releaseTag: 'public' },
      { id: 'step.shell', title: 'Shell', releaseTag: 'public' }
    ] }]
  });
  const after = parsePackageContractManifest({
    format: 'api-contract.package.v1',
    packageName: '@async/pipeline',
    catalogs: [{ format: 'api-contract.catalog.v1', contractId: '@async/pipeline.declaration', features: [
      { id: 'task.run', title: 'Task', releaseTag: 'public' }
    ] }]
  });
  const used = createSurface({ contractId: '@async/pipeline.declaration', features: ['step.shell'] });
  const consumer = parsePackageContractManifest({
    format: 'api-contract.package.v1',
    packageName: '@async/claims-pipeline',
    usage: [{ packageName: '@async/claims-pipeline', dependencyName: '@async/pipeline', evidence: 'published-manifest', surface: used }]
  });
  const report = createImpactReport({ before, after, consumers: [consumer] });
  assert.equal(report.ok, false);
  assert.equal(report.impactedConsumers.length, 1);
  assert.deepEqual(report.removedFeatures, ['step.shell']);
});
