import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeScanReports({ outputRoot, scanResult }) {
  const summary = {
    schemaVersion: '0.1.0',
    status: 'completed',
    fixtureName: scanResult.fixtureName,
    tenant_id: scanResult.tenant_id,
    site_id: scanResult.site_id,
    summary: scanResult.summary,
    boundaries: {
      localFixtureOnly: true,
      externalHttpCrawling: false,
      cmsApiCalls: false,
      cmsWrites: false,
      protectedConfigRead: false,
      deployment: false,
      searchConsoleOrIndexing: false,
      livePagePublication: false
    }
  };
  await writeJson(path.join(outputRoot, 'SCAN_RESULT.json'), summary);
  await writeMarkdownReport({ outputRoot, scanResult, summary });
  return summary;
}

async function writeMarkdownReport({ outputRoot, scanResult, summary }) {
  const lines = [
    '# Outbound Link Scan Report',
    '',
    `Status: ${summary.status}`,
    '',
    `Fixture: \`${scanResult.fixtureName}\``,
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Outbound links | ${scanResult.summary.outboundLinkCount} |`,
    `| Instances | ${scanResult.summary.instanceCount} |`,
    `| Ignored non-outbound links | ${scanResult.summary.ignoredLinkCount} |`,
    `| Pages scanned | ${scanResult.summary.pagesScanned} |`,
    `| Stale instances | ${scanResult.summary.staleInstanceCount} |`,
    '',
    'Boundary: local fixture scanning only; no external HTTP crawling, CMS/API calls, CMS writes, protected config reads, deployment, indexing, or live-page publication.'
  ];
  const fs = await import('node:fs/promises');
  await fs.writeFile(path.join(outputRoot, 'OUTBOUND_LINK_SCAN_REPORT.md'), `${lines.join('\n')}\n`, 'utf8');
}
