import fs from 'node:fs/promises';
import path from 'node:path';
import { pathExists, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpRenderPath } from '../utils/safe-paths.mjs';
import { renderFixture } from './rendering-controller.mjs';
import { writeRenderReports } from './render-report-writer.mjs';

export async function runRenderFixture({
  fixturePath,
  storePath,
  outputPath,
  overwrite = false,
  now = new Date()
}) {
  const outputRoot = resolveTmpRenderPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`render output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const renderResult = await renderFixture({ fixturePath, storePath, now });
  await writeJson(path.join(outputRoot, 'render-decisions.json'), {
    schemaVersion: renderResult.schemaVersion,
    tenant_id: renderResult.tenant_id,
    site_id: renderResult.site_id,
    fixtureName: renderResult.fixtureName,
    rendered_at: renderResult.rendered_at,
    render_decisions: renderResult.render_decisions
  });
  await fs.writeFile(path.join(outputRoot, 'static-export.html'), renderStaticExport(renderResult), 'utf8');
  const report = await writeRenderReports({ outputRoot, renderResult });

  return {
    outputRoot,
    renderResult,
    report
  };
}

export function renderStaticExport(renderResult) {
  const snippets = renderResult.render_decisions.map((decision) => {
    const marker = [
      'outbound-link',
      `instance=${decision.instance_id ?? 'unknown'}`,
      `action=${decision.render_action}`,
      `reason=${decision.reason_code}`
    ].join(' ');
    return `<!-- ${marker} -->${decision.rendered_output}`;
  });
  return `${snippets.join('\n')}\n`;
}
