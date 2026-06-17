import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bindApiHandlers,
  createOperationSurface,
  defineApiContract,
  generateCliDescriptor,
  generateDashboardManifest,
  generatePackageManifest,
  invokeOperation,
  parsePackageContractManifest,
  renderApiSurfaceMarkdown
} from '../dist/index.js';
import { diffPackageContracts } from '../dist/index.js';
import {
  createSchemaFeature,
  defineSchema,
  jsonSchemaAdapter,
  standardSchemaAdapter
} from '../dist/schema.js';
import {
  defineCliProjection,
  defineDashboardProjection,
  defineProjectionSet
} from '../dist/projection.js';
import {
  generateApiSurfaceMarkdown,
  generateMachineCliRouter,
  generateTypeScriptClient
} from '../dist/generators.js';

const projectInitInput = jsonSchemaAdapter({
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' },
    directory: { type: 'string', default: '.' }
  }
}, {
  parse(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('input must be an object');
    const input = value;
    if (typeof input.name !== 'string') throw new Error('name must be a string');
    return { name: input.name, directory: typeof input.directory === 'string' ? input.directory : '.' };
  },
  defaults: () => ({ directory: '.' }),
  examples: () => [{ name: 'Acme Console', directory: './acme-console' }]
});

const projectResult = jsonSchemaAdapter({
  type: 'object',
  required: ['ok'],
  properties: {
    ok: { type: 'boolean' },
    reportPath: { type: 'string' }
  }
});

const projectConfigSchema = defineSchema({
  id: 'project.config',
  title: 'Project config',
  description: 'Local project configuration shape.',
  adapter: jsonSchemaAdapter({
    type: 'object',
    properties: {
      name: { type: 'string' },
      directory: { type: 'string' }
    }
  }),
  fields: [{
    field: 'name',
    label: 'Project name',
    helpText: 'Human-readable project name.',
    widget: 'text',
    prompt: 'What is the project name?'
  }]
});

function workspaceContract() {
  return defineApiContract({
    packageName: '@acme/workspace-tool',
    title: 'Workspace Tool',
    docs: [{
      id: 'readme',
      path: 'README.md',
      summary: 'Explains how workspace operations project into API, CLI, and dashboard surfaces.'
    }],
    schemas: [projectConfigSchema],
    projections: defineProjectionSet({
      cli: [defineCliProjection({ command: 'project inspect', interactive: false })],
      dashboard: [defineDashboardProjection({ group: 'Project', view: 'detail', transport: 'machine-cli' })]
    }),
    operations: {
      'project.init': {
        title: 'Initialize project',
        description: 'Create a local project workspace.',
        input: projectInitInput,
        output: projectResult,
        effects: ['filesystem.write'],
        docs: ['readme'],
        receipts: [{ kind: 'report', pathTemplate: 'reports/init-{timestamp}.md', required: true }],
        cli: { command: 'project init', interactive: true },
        dashboard: { group: 'Project', view: 'form', resultView: 'summary', sort: 10 }
      },
      'project.verify': {
        title: 'Verify project',
        description: 'Check the local project and write a verification report.',
        output: projectResult,
        effects: ['filesystem.read'],
        cli: { command: ['project', 'verify'] },
        dashboard: { group: 'Project', view: 'summary', resultView: 'log', sort: 20 }
      }
    }
  });
}

test('defineApiContract derives operation surfaces and package manifests', () => {
  const contract = workspaceContract();
  const surface = createOperationSurface(contract);
  assert.equal(surface.contractId, '@acme/workspace-tool.operations');
  assert.deepEqual(surface.features, ['operation.project.init', 'operation.project.verify']);

  const manifest = generatePackageManifest(contract);
  assert.equal(manifest.packageName, '@acme/workspace-tool');
  assert.equal(manifest['x-interface'].format, 'api-contract.interface.v1');
  assert.equal(manifest['x-interface'].operations.length, 2);
  assert.equal(manifest['x-interface'].schemas[0].id, 'project.config');
  assert.equal(manifest['x-interface'].projections.cli[0].command, 'project inspect');

  const parsed = parsePackageContractManifest(manifest);
  assert.equal(parsed['x-interface'].operations[0].id, 'project.init');
});

test('operation features participate in existing package diffs', () => {
  const before = generatePackageManifest(workspaceContract());
  const after = generatePackageManifest(defineApiContract({
    packageName: '@acme/workspace-tool',
    operations: {
      'project.init': {
        title: 'Initialize project'
      }
    }
  }));

  const diff = diffPackageContracts(parsePackageContractManifest(before), parsePackageContractManifest(after));
  assert.deepEqual(diff.removedFeatures, ['operation.project.verify']);
});

test('generated CLI descriptor exposes human commands and machine invoke commands', () => {
  const descriptor = generateCliDescriptor(workspaceContract(), { binaryName: 'workspace-tool' });
  const init = descriptor.commands.find((command) => command.operationId === 'project.init');
  assert.deepEqual(descriptor.machine.manifest, ['workspace-tool', 'api', 'manifest', '--json']);
  assert.deepEqual(init.command, ['project', 'init']);
  assert.deepEqual(init.invoke, ['workspace-tool', 'api', 'invoke', 'project.init', '--input-json', '<json>']);
  assert.equal(init.interactive, true);
  assert.deepEqual(init.effects, ['filesystem.write']);
});

test('generated dashboard manifest uses the machine CLI as transport', () => {
  const dashboard = generateDashboardManifest(workspaceContract(), { binaryName: 'workspace-tool' });
  const init = dashboard.operations.find((operation) => operation.id === 'project.init');
  assert.equal(dashboard.title, 'Workspace Tool');
  assert.equal(init.group, 'Project');
  assert.equal(init.view, 'form');
  assert.deepEqual(init.invoke, {
    transport: 'cli',
    command: ['workspace-tool', 'api', 'invoke', 'project.init', '--input-json', '<json>']
  });
});

test('schema metadata supports feature derivation and standard schema adapters', () => {
  const feature = createSchemaFeature(projectConfigSchema, { stability: 'stable' });
  assert.deepEqual(feature, {
    id: 'schema.project.config',
    title: 'Project config',
    releaseTag: 'public',
    lifecycle: 'active',
    description: 'Local project configuration shape.',
    stability: 'stable',
    group: 'schemas'
  });

  const adapter = standardSchemaAdapter({
    '~standard': {
      validate(value) {
        if (value === 'ok') return { value };
        return { issues: [{ message: 'expected ok' }] };
      }
    }
  });

  assert.equal(adapter.parse('ok'), 'ok');
  assert.throws(() => adapter.parse('nope'), /expected ok/);
});

test('generator subpath emits API markdown, machine CLI routers, and TypeScript clients', () => {
  const contract = workspaceContract();
  const manifest = generatePackageManifest(contract);
  const markdown = generateApiSurfaceMarkdown({ manifest });
  const router = generateMachineCliRouter(contract, { binaryName: 'workspace-tool' });
  const client = generateTypeScriptClient(contract, { clientName: 'workspaceToolClient' });

  assert.match(markdown, /## Operations/);
  assert.equal(router.format, 'api-contract.machine-cli-router.v1');
  assert.deepEqual(router.routes[0].describe, ['workspace-tool', 'api', 'describe', 'project.init', '--json']);
  assert.match(client, /export const operationIds/);
  assert.match(client, /workspaceToolClient/);
  assert.match(client, /"project\.init": \(input: unknown\) => invokeOperation/);
});

test('bound handlers keep programmatic invocation behind generated surfaces', async () => {
  const contract = workspaceContract();
  const api = bindApiHandlers(contract, {
    'project.init': (input) => ({ ok: true, reportPath: `${input.directory}/reports/init.md` }),
    'project.verify': () => ({ ok: true, reportPath: 'reports/verify.md' })
  });

  const result = await invokeOperation(api, 'project.init', { name: 'Acme Console' });
  assert.deepEqual(result, { ok: true, reportPath: './reports/init.md' });
});

test('API surface markdown includes operation projection details', () => {
  const markdown = renderApiSurfaceMarkdown({ manifest: generatePackageManifest(workspaceContract()) });
  assert.match(markdown, /## Operations/);
  assert.match(markdown, /`project\.init` \| `operation\.project\.init`/);
  assert.match(markdown, /`filesystem\.write`/);
  assert.match(markdown, /`project init`/);
  assert.match(markdown, /Project \/ form/);
});
