import fs from 'node:fs/promises';
import path from 'node:path';
import { readLocalStore } from '../store/local-store-reader.mjs';
import { pathExists, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpIntegrationPath } from '../utils/safe-paths.mjs';
import {
  buildStoreEnvelopes,
  buildValidationReport,
  integrationBoundaries,
  integrationSchemaVersion,
  readRenderDecisionsEnvelope,
  tenantBundleFiles,
  writeJsonFiles,
  writeValidationMarkdown
} from './integration-common.mjs';
import { writeDomainReviewReport } from './domain-review-writer.mjs';

export async function exportTenantBundle({
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
      throw new Error(`tenant bundle export output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  const bundleRoot = path.join(outputRoot, 'outbound-links');
  await fs.mkdir(bundleRoot, { recursive: true });

  const store = await readLocalStore(storePath);
  const envelopes = buildStoreEnvelopes(store);
  const renderDecisionsEnvelope = await readRenderDecisionsEnvelope({ renderedPath, store });
  const validationReport = buildValidationReport({
    store,
    renderDecisionsEnvelope,
    context: 'tenant-bundle-export'
  });

  await writeJsonFiles(outputRoot, {
    'outbound-links/outbound-links.json': envelopes.linksEnvelope,
    'outbound-links/outbound-link-instances.json': envelopes.instancesEnvelope,
    'outbound-links/outbound-link-policies.json': envelopes.policiesEnvelope,
    'outbound-links/outbound-link-scan-runs.json': envelopes.scanRunsEnvelope,
    'outbound-links/outbound-link-audit-summary.json': envelopes.auditSummary,
    'outbound-links/outbound-link-render-decisions.json': renderDecisionsEnvelope,
    'outbound-links/VALIDATION_RESULT.json': validationReport
  });
  await writeValidationMarkdown(path.join(bundleRoot, 'VALIDATION_RESULT.md'), validationReport, 'Tenant Bundle Outbound Link Validation Result');
  await writeDomainReviewReport({ filePath: path.join(bundleRoot, 'EXTERNAL_DOMAIN_REVIEW.md'), store, title: 'Tenant Bundle External Domain Review' });

  const manifest = {
    schemaVersion: integrationSchemaVersion,
    export_type: 'pumpkin-outbound-link-tenant-bundle-export',
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    generated_at: timestamp,
    files: tenantBundleFiles,
    summary: validationReport.summary,
    boundaries: integrationBoundaries()
  };
  await writeJson(path.join(outputRoot, 'TENANT_BUNDLE_EXPORT_MANIFEST.json'), manifest);

  return {
    outputRoot,
    manifest,
    validationReport
  };
}
