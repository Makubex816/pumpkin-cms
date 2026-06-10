import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson, pathExists } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolveTmpOutputPath } from '../utils/safe-paths.mjs';
import { scanFixture } from '../scanner/local-content-scanner.mjs';
import { writeScanReports } from '../reports/scan-report-writer.mjs';

export async function runScan({ fixturePath, outputPath, overwrite = false, now = new Date() }) {
  const resolvedFixture = resolveFixturePath(fixturePath);
  const outputRoot = resolveTmpOutputPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const fixture = await readJson(resolvedFixture);
  const scanResult = scanFixture(fixture, { now });

  await writeJson(path.join(outputRoot, 'outbound-links.json'), {
    schemaVersion: '0.1.0',
    tenant_id: scanResult.tenant_id,
    site_id: scanResult.site_id,
    outbound_links: scanResult.outbound_links
  });
  await writeJson(path.join(outputRoot, 'outbound-link-instances.json'), {
    schemaVersion: '0.1.0',
    tenant_id: scanResult.tenant_id,
    site_id: scanResult.site_id,
    outbound_link_instances: scanResult.outbound_link_instances
  });
  await writeJson(path.join(outputRoot, 'outbound-link-scan-run.json'), scanResult.scan_run);
  await writeJson(path.join(outputRoot, 'ignored-links.json'), {
    schemaVersion: '0.1.0',
    tenant_id: scanResult.tenant_id,
    site_id: scanResult.site_id,
    ignored_links: scanResult.ignoredLinks
  });
  const report = await writeScanReports({ outputRoot, scanResult });

  return {
    outputRoot,
    fixturePath: resolvedFixture,
    scanResult,
    report
  };
}
