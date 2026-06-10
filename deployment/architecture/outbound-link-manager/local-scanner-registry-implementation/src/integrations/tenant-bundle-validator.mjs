import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpIntegrationPath } from '../utils/safe-paths.mjs';
import { integrationBoundaries, integrationSchemaVersion, requiredFileFailures, tenantBundleFiles } from './integration-common.mjs';
import { validateCommonExportShape } from './backup-center-export-validator.mjs';

export async function validateTenantBundle({ bundlePath, writeReport = true }) {
  const outputRoot = resolveTmpIntegrationPath(bundlePath);
  const failures = [];
  const warnings = [];
  await requiredFileFailures({ root: outputRoot, files: tenantBundleFiles, failures });

  const linksEnvelope = await readOptionalJson(outputRoot, 'outbound-links/outbound-links.json', failures);
  const instancesEnvelope = await readOptionalJson(outputRoot, 'outbound-links/outbound-link-instances.json', failures);
  const policiesEnvelope = await readOptionalJson(outputRoot, 'outbound-links/outbound-link-policies.json', failures);
  const scanRunsEnvelope = await readOptionalJson(outputRoot, 'outbound-links/outbound-link-scan-runs.json', failures);
  const auditSummary = await readOptionalJson(outputRoot, 'outbound-links/outbound-link-audit-summary.json', failures);
  const renderDecisionsEnvelope = await readOptionalJson(outputRoot, 'outbound-links/outbound-link-render-decisions.json', failures);
  const validationReport = await readOptionalJson(outputRoot, 'outbound-links/VALIDATION_RESULT.json', failures);

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
    renderDecisions: renderDecisionsEnvelope?.render_decisions ?? []
  });
}

async function readOptionalJson(outputRoot, relativePath, failures) {
  try {
    return await readJson(path.join(outputRoot, relativePath));
  } catch (error) {
    failures.push({ code: 'TENANT_BUNDLE_JSON_MISSING_OR_INVALID', path: relativePath, message: error.message });
    return null;
  }
}

async function finalize({ outputRoot, failures, warnings, writeReport, links, instances, policies, renderDecisions }) {
  const result = {
    schemaVersion: integrationSchemaVersion,
    validator: 'pumpkin-outbound-link-tenant-bundle-validator',
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      linkCount: links.length,
      instanceCount: instances.length,
      policyCount: policies.length,
      renderDecisionCount: renderDecisions.length,
      warningCount: warnings.length,
      failureCount: failures.length
    },
    warnings,
    failures,
    boundaries: integrationBoundaries()
  };
  if (writeReport) {
    await writeJson(path.join(outputRoot, 'TENANT_BUNDLE_VALIDATION_RESULT.json'), result);
    await fs.writeFile(path.join(outputRoot, 'TENANT_BUNDLE_VALIDATION_RESULT.md'), `# Tenant Bundle Validation Result

Status: ${result.status}

Links: ${result.summary.linkCount}

Instances: ${result.summary.instanceCount}

Render decisions: ${result.summary.renderDecisionCount}

Failures: ${result.summary.failureCount}
`, 'utf8');
  }
  return result;
}
