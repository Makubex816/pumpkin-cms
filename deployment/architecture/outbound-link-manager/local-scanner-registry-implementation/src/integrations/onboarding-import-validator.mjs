import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpIntegrationPath } from '../utils/safe-paths.mjs';
import { integrationBoundaries, integrationSchemaVersion, onboardingImportFiles, requiredFileFailures } from './integration-common.mjs';

export async function validateOnboardingImport({ importPath, writeReport = true }) {
  const outputRoot = resolveTmpIntegrationPath(importPath);
  const failures = [];
  const warnings = [];
  await requiredFileFailures({ root: outputRoot, files: onboardingImportFiles, failures });
  const expected = await readOptionalJson(outputRoot, 'outbound-links.expected.json', failures);
  const policyEnvelope = await readOptionalJson(outputRoot, 'outbound-link-policy.json', failures);
  const report = await readOptionalJson(outputRoot, 'outbound-link-validation-report.json', failures);

  if (expected && policyEnvelope) {
    if (expected.tenant_id !== policyEnvelope.tenant_id || expected.site_id !== policyEnvelope.site_id) {
      failures.push({ code: 'ONBOARDING_SCOPE_MISMATCH', path: 'outbound-link-policy.json', message: 'policy scope does not match expected links' });
    }
    const activePolicy = policyEnvelope.outbound_link_policy ?? {};
    const blockedDomains = new Set(activePolicy.blocked_domains ?? []);
    const allowedDomains = new Set(activePolicy.allowed_domains ?? []);
    for (const link of expected.outbound_links ?? []) {
      if (link.tenant_id !== expected.tenant_id || link.site_id !== expected.site_id) {
        failures.push({ code: 'ONBOARDING_LINK_SCOPE_MISMATCH', path: `outbound-links.expected.json:${link.id}`, message: 'link scope does not match import scope' });
      }
      if (link.status === 'domain_blocked' || blockedDomains.has(link.domain)) {
        failures.push({ code: 'ONBOARDING_BLOCKED_DOMAIN', path: `outbound-links.expected.json:${link.id}`, message: 'blocked domain cannot pass onboarding import validation' });
      } else if (link.status === 'pending_review' || (activePolicy.review_required_for_new_domains === true && !allowedDomains.has(link.domain))) {
        failures.push({ code: 'ONBOARDING_UNREVIEWED_DOMAIN', path: `outbound-links.expected.json:${link.id}`, message: 'unreviewed domain cannot pass onboarding import validation' });
      }
    }
  }
  if (report?.status === 'failed') {
    for (const failure of report.failures ?? []) {
      if (!failures.some((item) => item.code === failure.code && item.path?.includes(failure.link_id ?? ''))) {
        failures.push({ code: failure.code, path: failure.link_id ?? 'outbound-link-validation-report.json', message: failure.message });
      }
    }
  }

  return finalize({
    outputRoot,
    failures,
    warnings,
    writeReport,
    links: expected?.outbound_links ?? [],
    instances: expected?.outbound_link_instances ?? []
  });
}

async function readOptionalJson(outputRoot, relativePath, failures) {
  try {
    return await readJson(path.join(outputRoot, relativePath));
  } catch (error) {
    failures.push({ code: 'ONBOARDING_JSON_MISSING_OR_INVALID', path: relativePath, message: error.message });
    return null;
  }
}

async function finalize({ outputRoot, failures, warnings, writeReport, links, instances }) {
  const result = {
    schemaVersion: integrationSchemaVersion,
    validator: 'pumpkin-outbound-link-onboarding-import-validator',
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      linkCount: links.length,
      instanceCount: instances.length,
      warningCount: warnings.length,
      failureCount: failures.length
    },
    warnings,
    failures,
    boundaries: integrationBoundaries()
  };
  if (writeReport) {
    await writeJson(path.join(outputRoot, 'ONBOARDING_IMPORT_VALIDATION_RESULT.json'), result);
    await fs.writeFile(path.join(outputRoot, 'ONBOARDING_IMPORT_VALIDATION_RESULT.md'), `# Onboarding Import Validation Result

Status: ${result.status}

Links: ${result.summary.linkCount}

Instances: ${result.summary.instanceCount}

Failures: ${result.summary.failureCount}
`, 'utf8');
  }
  return result;
}
