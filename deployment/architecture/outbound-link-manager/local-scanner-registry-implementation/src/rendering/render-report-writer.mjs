import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeRenderReports({ outputRoot, renderResult }) {
  const report = {
    schemaVersion: renderResult.schemaVersion,
    tenant_id: renderResult.tenant_id,
    site_id: renderResult.site_id,
    fixtureName: renderResult.fixtureName,
    rendered_at: renderResult.rendered_at,
    summary: renderResult.summary,
    known_link_ids: renderResult.known_link_ids,
    known_instance_ids: renderResult.known_instance_ids,
    boundaries: {
      local_only: true,
      production_renderer_integration: false,
      external_http_crawling: false,
      live_http_checks: false,
      cms_api_calls: false,
      cms_writes: false
    }
  };
  await writeJson(path.join(outputRoot, 'render-report.json'), report);
  await fs.writeFile(path.join(outputRoot, 'RENDER_REPORT.md'), renderMarkdown(report), 'utf8');
  return report;
}

function renderMarkdown(report) {
  return `# Render Report

Fixture: ${report.fixtureName}

| Metric | Count |
| --- | ---: |
| Decisions | ${report.summary.decisionCount} |
| Active anchors | ${report.summary.activeAnchorCount} |
| Blocked or disabled decisions | ${report.summary.blockedOrDisabledCount} |

Boundary: local/offline render decision prototype only. No production renderer integration, external crawling, live HTTP checks, CMS/API calls, CMS writes, deployment, indexing, or live-page publication.
`;
}
