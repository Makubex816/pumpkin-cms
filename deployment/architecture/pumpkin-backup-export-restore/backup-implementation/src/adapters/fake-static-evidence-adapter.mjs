import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';

export async function writeFakeStaticEvidence({ bundleRoot, request }) {
  const source = await readJson(request.fixtureRefs.staticEvidence);
  const routes =
    request.scope.scopeType === 'tenant'
      ? (source.routes ?? []).filter((route) => route.tenantKey === request.scope.tenantKey)
      : source.routes ?? [];
  const outputDir = path.join(bundleRoot, 'static');
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'static-output-manifest.json'), {
    source: 'fake-fixture',
    staticGenerationRun: false,
    routes
  });
  await fs.writeFile(
    path.join(outputDir, 'STATIC_OUTPUT_NOT_INCLUDED.md'),
    [
      '# Static Output Not Included',
      '',
      'This prototype records fake static evidence only.',
      '',
      '- No static generation was run.',
      '- No deployment artifact was created.',
      '- No live page publication occurred.',
      ''
    ].join('\n'),
    'utf8'
  );
  return [
    { path: 'static/static-output-manifest.json', kind: 'static-evidence', required: true, sensitivity: 'redacted', schemaRef: null },
    { path: 'static/STATIC_OUTPUT_NOT_INCLUDED.md', kind: 'static-evidence', required: true, sensitivity: 'redacted', schemaRef: null }
  ];
}
