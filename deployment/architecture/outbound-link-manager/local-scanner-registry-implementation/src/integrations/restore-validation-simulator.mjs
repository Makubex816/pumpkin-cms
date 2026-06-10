import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, pathExists, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpIntegrationPath } from '../utils/safe-paths.mjs';
import { countBy, integrationBoundaries, integrationSchemaVersion } from './integration-common.mjs';
import { validateBackupCenterExport } from './backup-center-export-validator.mjs';

export async function simulateRestoreValidation({
  exportPath,
  outputPath,
  overwrite = false,
  now = new Date()
}) {
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const exportRoot = resolveTmpIntegrationPath(exportPath);
  const outputRoot = resolveTmpIntegrationPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`restore validation output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const validation = await validateBackupCenterExport({ exportPath, writeReport: false });
  const linksEnvelope = await readJson(path.join(exportRoot, 'cms-content/outbound-links.json'));
  const instancesEnvelope = await readJson(path.join(exportRoot, 'cms-content/outbound-link-instances.json'));
  const policiesEnvelope = await readJson(path.join(exportRoot, 'cms-content/outbound-link-policies.json'));
  const renderDecisionsEnvelope = await readJson(path.join(exportRoot, 'cms-content/outbound-link-render-decisions.json'));
  const sourceReport = await readJson(path.join(exportRoot, 'cms-content/outbound-link-validation-report.json'));

  const result = {
    schemaVersion: integrationSchemaVersion,
    simulator: 'pumpkin-outbound-link-restore-validation-simulator',
    status: validation.status === 'passed' ? 'passed' : 'failed',
    tenant_id: linksEnvelope.tenant_id,
    site_id: linksEnvelope.site_id,
    simulated_at: timestamp,
    checks: {
      backup_export_validation: validation.status,
      link_count_preserved: sourceReport.summary.linkCount === linksEnvelope.outbound_links.length,
      instance_count_preserved: sourceReport.summary.instanceCount === instancesEnvelope.outbound_link_instances.length,
      policy_state_preserved: sourceReport.summary.policyCount === policiesEnvelope.outbound_link_policies.length,
      render_decisions_preserved: sourceReport.summary.renderDecisionCount === renderDecisionsEnvelope.render_decisions.length,
      disabled_statuses_preserved: sourceReport.summary.linksByStatus?.disabled === countBy(linksEnvelope.outbound_links, 'status').disabled
    },
    summary: {
      linkCount: linksEnvelope.outbound_links.length,
      instanceCount: instancesEnvelope.outbound_link_instances.length,
      policyCount: policiesEnvelope.outbound_link_policies.length,
      renderDecisionCount: renderDecisionsEnvelope.render_decisions.length,
      linksByStatus: countBy(linksEnvelope.outbound_links, 'status'),
      instancesByStatus: countBy(instancesEnvelope.outbound_link_instances, 'status'),
      failureCount: validation.summary.failureCount
    },
    failures: validation.failures,
    boundaries: integrationBoundaries()
  };
  await writeJson(path.join(outputRoot, 'RESTORE_VALIDATION_RESULT.json'), result);
  await fs.writeFile(path.join(outputRoot, 'RESTORE_VALIDATION_RESULT.md'), renderRestoreMarkdown(result), 'utf8');
  return {
    outputRoot,
    result
  };
}

function renderRestoreMarkdown(result) {
  return `# Outbound Link Restore Validation Simulation

Status: ${result.status}

| Check | Result |
| --- | --- |
| Backup export validation | ${result.checks.backup_export_validation} |
| Link count preserved | ${result.checks.link_count_preserved} |
| Instance count preserved | ${result.checks.instance_count_preserved} |
| Policy state preserved | ${result.checks.policy_state_preserved} |
| Render decisions preserved | ${result.checks.render_decisions_preserved} |
| Disabled statuses preserved | ${result.checks.disabled_statuses_preserved} |

Boundary: local simulation only. No live restore was performed.
`;
}
