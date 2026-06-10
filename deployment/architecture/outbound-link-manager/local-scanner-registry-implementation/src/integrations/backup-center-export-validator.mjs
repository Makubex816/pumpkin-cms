import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpIntegrationPath } from '../utils/safe-paths.mjs';
import { backupCenterFiles, integrationBoundaries, integrationSchemaVersion, requiredFileFailures } from './integration-common.mjs';

export async function validateBackupCenterExport({ exportPath, writeReport = true }) {
  const outputRoot = resolveTmpIntegrationPath(exportPath);
  const failures = [];
  const warnings = [];
  await requiredFileFailures({ root: outputRoot, files: backupCenterFiles, failures });

  const linksEnvelope = await readOptionalJson(outputRoot, 'cms-content/outbound-links.json', failures);
  const instancesEnvelope = await readOptionalJson(outputRoot, 'cms-content/outbound-link-instances.json', failures);
  const policiesEnvelope = await readOptionalJson(outputRoot, 'cms-content/outbound-link-policies.json', failures);
  const scanRunsEnvelope = await readOptionalJson(outputRoot, 'cms-content/outbound-link-scan-runs.json', failures);
  const auditSummary = await readOptionalJson(outputRoot, 'cms-content/outbound-link-audit-summary.json', failures);
  const renderDecisionsEnvelope = await readOptionalJson(outputRoot, 'cms-content/outbound-link-render-decisions.json', failures);
  const validationReport = await readOptionalJson(outputRoot, 'cms-content/outbound-link-validation-report.json', failures);

  if (linksEnvelope && instancesEnvelope && policiesEnvelope && auditSummary && renderDecisionsEnvelope) {
    validateCommonExportShape({
      linksEnvelope,
      instancesEnvelope,
      policiesEnvelope,
      scanRunsEnvelope,
      auditSummary,
      renderDecisionsEnvelope,
      validationReport,
      failures
    });
  }

  return finalize({
    outputRoot,
    failures,
    warnings,
    writeReport,
    links: linksEnvelope?.outbound_links ?? [],
    instances: instancesEnvelope?.outbound_link_instances ?? [],
    policies: policiesEnvelope?.outbound_link_policies ?? [],
    scanRuns: scanRunsEnvelope?.outbound_link_scan_runs ?? [],
    renderDecisions: renderDecisionsEnvelope?.render_decisions ?? []
  });
}

export function validateCommonExportShape({
  linksEnvelope,
  instancesEnvelope,
  policiesEnvelope,
  scanRunsEnvelope,
  auditSummary,
  renderDecisionsEnvelope,
  validationReport,
  failures
}) {
  const tenantId = linksEnvelope.tenant_id;
  const siteId = linksEnvelope.site_id;
  for (const [label, envelope] of Object.entries({
    instancesEnvelope,
    policiesEnvelope,
    scanRunsEnvelope,
    auditSummary,
    renderDecisionsEnvelope,
    validationReport
  })) {
    if (!envelope) {
      continue;
    }
    if (envelope.tenant_id !== tenantId || envelope.site_id !== siteId) {
      failures.push({ code: 'INTEGRATION_SCOPE_MISMATCH', path: label, message: 'tenant/site scope does not match outbound-links export' });
    }
  }
  const linkIds = new Set((linksEnvelope.outbound_links ?? []).map((link) => link.id));
  for (const link of linksEnvelope.outbound_links ?? []) {
    requireScoped(link, tenantId, siteId, `link:${link.id}`, failures);
  }
  for (const instance of instancesEnvelope.outbound_link_instances ?? []) {
    requireScoped(instance, tenantId, siteId, `instance:${instance.id}`, failures);
    if (!linkIds.has(instance.outbound_link_id)) {
      failures.push({ code: 'INTEGRATION_INSTANCE_LINK_MISSING', path: `instance:${instance.id}`, message: 'instance references missing exported link' });
    }
  }
  for (const policy of policiesEnvelope.outbound_link_policies ?? []) {
    requireScoped(policy, tenantId, siteId, `policy:${policy.id}`, failures);
  }
  for (const decision of renderDecisionsEnvelope.render_decisions ?? []) {
    requireScoped(decision, tenantId, siteId, `render:${decision.instance_id}`, failures);
    if (decision.outbound_link_id && !linkIds.has(decision.outbound_link_id)) {
      failures.push({ code: 'INTEGRATION_RENDER_LINK_MISSING', path: `render:${decision.instance_id}`, message: 'render decision references missing exported link' });
    }
  }
  if (auditSummary.contains_secret_values !== false) {
    failures.push({ code: 'AUDIT_SUMMARY_SECRET_FLAG_INVALID', path: 'outbound-link-audit-summary.json', message: 'audit summary must be marked non-secret' });
  }
}

function requireScoped(record, tenantId, siteId, pathName, failures) {
  if (record.tenant_id !== tenantId || record.site_id !== siteId) {
    failures.push({ code: 'INTEGRATION_RECORD_SCOPE_MISMATCH', path: pathName, message: 'record scope does not match export scope' });
  }
}

async function readOptionalJson(outputRoot, relativePath, failures) {
  try {
    return await readJson(path.join(outputRoot, relativePath));
  } catch (error) {
    failures.push({ code: 'INTEGRATION_JSON_MISSING_OR_INVALID', path: relativePath, message: error.message });
    return null;
  }
}

async function finalize({
  outputRoot,
  failures,
  warnings,
  writeReport,
  links,
  instances,
  policies,
  scanRuns,
  renderDecisions
}) {
  const result = {
    schemaVersion: integrationSchemaVersion,
    validator: 'pumpkin-outbound-link-backup-center-export-validator',
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      linkCount: links.length,
      instanceCount: instances.length,
      policyCount: policies.length,
      scanRunCount: scanRuns.length,
      renderDecisionCount: renderDecisions.length,
      disabledLinkCount: links.filter((link) => link.status === 'disabled').length,
      domainBlockedLinkCount: links.filter((link) => link.status === 'domain_blocked').length,
      pendingReviewLinkCount: links.filter((link) => link.status === 'pending_review').length,
      warningCount: warnings.length,
      failureCount: failures.length
    },
    warnings,
    failures,
    boundaries: integrationBoundaries()
  };
  if (writeReport) {
    await writeJson(path.join(outputRoot, 'BACKUP_CENTER_EXPORT_VALIDATION_RESULT.json'), result);
    await fs.writeFile(path.join(outputRoot, 'BACKUP_CENTER_EXPORT_VALIDATION_RESULT.md'), renderResultMarkdown(result), 'utf8');
  }
  return result;
}

function renderResultMarkdown(result) {
  return `# Backup Center Export Validation Result

Status: ${result.status}

| Metric | Count |
| --- | ---: |
| Links | ${result.summary.linkCount} |
| Instances | ${result.summary.instanceCount} |
| Policies | ${result.summary.policyCount} |
| Scan runs | ${result.summary.scanRunCount} |
| Render decisions | ${result.summary.renderDecisionCount} |
| Failures | ${result.summary.failureCount} |

Boundary: local/offline Backup Center compatibility validation only.
`;
}
