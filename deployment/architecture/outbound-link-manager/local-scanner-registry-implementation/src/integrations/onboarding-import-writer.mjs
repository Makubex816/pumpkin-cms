import fs from 'node:fs/promises';
import path from 'node:path';
import { readLocalStore } from '../store/local-store-reader.mjs';
import { getActivePolicy } from '../policies/policy-applier.mjs';
import { pathExists, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpIntegrationPath } from '../utils/safe-paths.mjs';
import { integrationBoundaries, integrationSchemaVersion, onboardingImportFiles } from './integration-common.mjs';
import { writeDomainReviewReport } from './domain-review-writer.mjs';

export async function createOnboardingImport({
  storePath,
  outputPath,
  overwrite = false,
  now = new Date()
}) {
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const outputRoot = resolveTmpIntegrationPath(outputPath);
  if (await pathExists(outputRoot)) {
    if (!overwrite) {
      throw new Error(`onboarding import output already exists: ${outputPath}`);
    }
    await fs.rm(outputRoot, { recursive: true, force: true });
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const store = await readLocalStore(storePath);
  const activePolicy = getActivePolicy(store);
  const expected = {
    schemaVersion: integrationSchemaVersion,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    generated_at: timestamp,
    outbound_links: store.links,
    outbound_link_instances: store.instances,
    expectations: {
      disabled_state_must_survive_import: true,
      blocked_domains_require_owner_review: true,
      pending_review_domains_require_owner_review: true
    }
  };
  const policyEnvelope = {
    schemaVersion: integrationSchemaVersion,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    active_policy_id: activePolicy?.id ?? null,
    outbound_link_policy: activePolicy
  };
  const validationReport = buildOnboardingReadinessReport({ store, activePolicy });

  await writeJson(path.join(outputRoot, 'outbound-links.expected.json'), expected);
  await writeJson(path.join(outputRoot, 'outbound-link-policy.json'), policyEnvelope);
  await writeJson(path.join(outputRoot, 'outbound-link-validation-report.json'), validationReport);
  await fs.writeFile(path.join(outputRoot, 'outbound-link-validation-report.md'), renderOnboardingMarkdown(validationReport), 'utf8');
  await writeDomainReviewReport({ filePath: path.join(outputRoot, 'external-domain-review.md'), store, title: 'Onboarding External Domain Review' });
  await writeJson(path.join(outputRoot, 'ONBOARDING_IMPORT_MANIFEST.json'), {
    schemaVersion: integrationSchemaVersion,
    export_type: 'pumpkin-outbound-link-onboarding-import',
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    generated_at: timestamp,
    files: onboardingImportFiles,
    boundaries: integrationBoundaries()
  });

  return {
    outputRoot,
    validationReport
  };
}

export function buildOnboardingReadinessReport({ store, activePolicy }) {
  const blockedDomains = new Set(activePolicy?.blocked_domains ?? []);
  const allowedDomains = new Set(activePolicy?.allowed_domains ?? []);
  const failures = [];
  const warnings = [];
  for (const link of store.links) {
    if (link.status === 'domain_blocked' || blockedDomains.has(link.domain)) {
      failures.push({
        code: 'ONBOARDING_BLOCKED_DOMAIN',
        domain: link.domain,
        link_id: link.id,
        message: 'blocked outbound domain requires owner remediation before import'
      });
      continue;
    }
    if (link.status === 'pending_review' || (activePolicy?.review_required_for_new_domains === true && !allowedDomains.has(link.domain))) {
      failures.push({
        code: 'ONBOARDING_UNREVIEWED_DOMAIN',
        domain: link.domain,
        link_id: link.id,
        message: 'unreviewed outbound domain requires owner approval before import'
      });
    }
  }
  return {
    schemaVersion: integrationSchemaVersion,
    validator: 'pumpkin-outbound-link-onboarding-import-local-report',
    status: failures.length === 0 ? 'passed' : 'failed',
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    summary: {
      linkCount: store.links.length,
      instanceCount: store.instances.length,
      disabledLinkCount: store.links.filter((link) => link.status === 'disabled').length,
      blockedDomainCount: failures.filter((failure) => failure.code === 'ONBOARDING_BLOCKED_DOMAIN').length,
      unreviewedDomainCount: failures.filter((failure) => failure.code === 'ONBOARDING_UNREVIEWED_DOMAIN').length,
      warningCount: warnings.length,
      failureCount: failures.length
    },
    warnings,
    failures,
    boundaries: integrationBoundaries()
  };
}

function renderOnboardingMarkdown(report) {
  const failureRows = report.failures.map((failure) => `| ${failure.code} | ${failure.domain} | ${failure.link_id} | ${failure.message} |`).join('\n');
  return `# Onboarding Outbound Link Validation Report

Status: ${report.status}

| Metric | Count |
| --- | ---: |
| Links | ${report.summary.linkCount} |
| Instances | ${report.summary.instanceCount} |
| Disabled links | ${report.summary.disabledLinkCount} |
| Blocked domains | ${report.summary.blockedDomainCount} |
| Unreviewed domains | ${report.summary.unreviewedDomainCount} |
| Failures | ${report.summary.failureCount} |

## Findings

| Code | Domain | Link | Message |
| --- | --- | --- | --- |
${failureRows || '| none | none | none | none |'}

Boundary: local/offline onboarding validation only.
`;
}
