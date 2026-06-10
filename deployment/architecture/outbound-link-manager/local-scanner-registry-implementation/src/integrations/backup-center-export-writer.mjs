import fs from 'node:fs/promises';
import path from 'node:path';
import { readLocalStore } from '../store/local-store-reader.mjs';
import { pathExists, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpIntegrationPath } from '../utils/safe-paths.mjs';
import {
  backupCenterFiles,
  buildStoreEnvelopes,
  buildValidationReport,
  integrationBoundaries,
  integrationSchemaVersion,
  readRenderDecisionsEnvelope,
  writeJsonFiles,
  writeValidationMarkdown
} from './integration-common.mjs';

export async function exportBackupCenter({
  storePath,
  renderedPath = null,
  outputPath,
  overwrite = false,
  now = new Date()
}) {
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const outputRoot = resolveTmpIntegrationPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`backup export output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(path.join(outputRoot, 'cms-content'), { recursive: true });

  const store = await readLocalStore(storePath);
  const envelopes = buildStoreEnvelopes(store);
  const renderDecisionsEnvelope = await readRenderDecisionsEnvelope({ renderedPath, store });
  const validationReport = buildValidationReport({
    store,
    renderDecisionsEnvelope,
    context: 'backup-center-export'
  });

  await writeJsonFiles(outputRoot, {
    'cms-content/outbound-links.json': envelopes.linksEnvelope,
    'cms-content/outbound-link-instances.json': envelopes.instancesEnvelope,
    'cms-content/outbound-link-policies.json': envelopes.policiesEnvelope,
    'cms-content/outbound-link-scan-runs.json': envelopes.scanRunsEnvelope,
    'cms-content/outbound-link-audit-summary.json': envelopes.auditSummary,
    'cms-content/outbound-link-render-decisions.json': renderDecisionsEnvelope,
    'cms-content/outbound-link-validation-report.json': validationReport
  });
  await writeValidationMarkdown(path.join(outputRoot, 'cms-content/OUTBOUND_LINK_VALIDATION_REPORT.md'), validationReport, 'Backup Center Outbound Link Validation Report');

  const manifest = {
    schemaVersion: integrationSchemaVersion,
    export_type: 'pumpkin-outbound-link-backup-center-export',
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    generated_at: timestamp,
    files: backupCenterFiles,
    summary: validationReport.summary,
    boundaries: integrationBoundaries()
  };
  await writeJson(path.join(outputRoot, 'BACKUP_CENTER_EXPORT_MANIFEST.json'), manifest);

  return {
    outputRoot,
    manifest,
    validationReport
  };
}
