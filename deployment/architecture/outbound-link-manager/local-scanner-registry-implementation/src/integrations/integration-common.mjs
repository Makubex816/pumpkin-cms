import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpRenderPath } from '../utils/safe-paths.mjs';
import { getActivePolicy } from '../policies/policy-applier.mjs';

export const integrationSchemaVersion = '0.4.0';

export const backupCenterFiles = [
  'cms-content/outbound-links.json',
  'cms-content/outbound-link-instances.json',
  'cms-content/outbound-link-policies.json',
  'cms-content/outbound-link-scan-runs.json',
  'cms-content/outbound-link-audit-summary.json',
  'cms-content/outbound-link-render-decisions.json',
  'cms-content/outbound-link-validation-report.json',
  'cms-content/OUTBOUND_LINK_VALIDATION_REPORT.md'
];

export const tenantBundleFiles = [
  'outbound-links/outbound-links.json',
  'outbound-links/outbound-link-instances.json',
  'outbound-links/outbound-link-policies.json',
  'outbound-links/outbound-link-scan-runs.json',
  'outbound-links/outbound-link-audit-summary.json',
  'outbound-links/outbound-link-render-decisions.json',
  'outbound-links/EXTERNAL_DOMAIN_REVIEW.md',
  'outbound-links/VALIDATION_RESULT.md'
];

export const onboardingImportFiles = [
  'outbound-links.expected.json',
  'outbound-link-policy.json',
  'external-domain-review.md',
  'outbound-link-validation-report.md'
];

export function buildStoreEnvelopes(store) {
  return {
    linksEnvelope: {
      schemaVersion: store.linksEnvelope.schemaVersion,
      tenant_id: store.tenant_id,
      site_id: store.site_id,
      outbound_links: store.links
    },
    instancesEnvelope: {
      schemaVersion: store.instancesEnvelope.schemaVersion,
      tenant_id: store.tenant_id,
      site_id: store.site_id,
      outbound_link_instances: store.instances
    },
    policiesEnvelope: {
      schemaVersion: store.policiesEnvelope.schemaVersion,
      tenant_id: store.tenant_id,
      site_id: store.site_id,
      active_policy_id: store.policiesEnvelope.active_policy_id,
      outbound_link_policies: store.policies
    },
    scanRunsEnvelope: {
      schemaVersion: store.scanRunsEnvelope.schemaVersion,
      tenant_id: store.tenant_id,
      site_id: store.site_id,
      outbound_link_scan_runs: store.scanRuns
    },
    auditSummary: buildAuditSummary(store),
    renderDecisionsEnvelope: buildEmptyRenderDecisionsEnvelope(store)
  };
}

export async function readRenderDecisionsEnvelope({ renderedPath, store }) {
  if (!renderedPath) {
    return buildEmptyRenderDecisionsEnvelope(store);
  }
  const renderRoot = resolveTmpRenderPath(renderedPath);
  const envelope = await readJson(path.join(renderRoot, 'render-decisions.json'));
  if (envelope.tenant_id !== store.tenant_id || envelope.site_id !== store.site_id) {
    throw new Error('render decisions scope does not match local store');
  }
  return {
    schemaVersion: envelope.schemaVersion ?? '0.3.0',
    tenant_id: envelope.tenant_id,
    site_id: envelope.site_id,
    source_fixture: envelope.fixtureName ?? null,
    rendered_at: envelope.rendered_at ?? null,
    render_decisions: envelope.render_decisions ?? []
  };
}

export function buildAuditSummary(store) {
  return {
    schemaVersion: integrationSchemaVersion,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    audit_log_count: store.auditLogs.length,
    actions: countBy(store.auditLogs, 'action'),
    latest_audit_at: store.auditLogs.at(-1)?.created_at ?? null,
    contains_secret_values: false
  };
}

export function buildValidationReport({ store, renderDecisionsEnvelope, context }) {
  const activePolicy = getActivePolicy(store);
  const linksByStatus = countBy(store.links, 'status');
  const instancesByStatus = countBy(store.instances, 'status');
  const renderDecisionsByAction = countBy(renderDecisionsEnvelope.render_decisions ?? [], 'render_action');
  const domains = summarizeDomains({ store, activePolicy });
  const failures = [];
  const warnings = [];
  for (const domain of domains) {
    if (domain.status === 'domain_blocked') {
      warnings.push({
        code: 'DOMAIN_BLOCKED_PRESENT',
        domain: domain.domain,
        message: 'blocked domain is preserved for operator review'
      });
    }
    if (domain.status === 'pending_review') {
      warnings.push({
        code: 'DOMAIN_PENDING_REVIEW_PRESENT',
        domain: domain.domain,
        message: 'pending-review domain is preserved for operator review'
      });
    }
  }
  return {
    schemaVersion: integrationSchemaVersion,
    validator: 'pumpkin-outbound-link-integration-local-report',
    context,
    status: failures.length === 0 ? 'passed' : 'failed',
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    summary: {
      linkCount: store.links.length,
      instanceCount: store.instances.length,
      policyCount: store.policies.length,
      scanRunCount: store.scanRuns.length,
      auditLogCount: store.auditLogs.length,
      renderDecisionCount: (renderDecisionsEnvelope.render_decisions ?? []).length,
      linksByStatus,
      instancesByStatus,
      renderDecisionsByAction,
      domainCount: domains.length,
      warningCount: warnings.length,
      failureCount: failures.length
    },
    domains,
    warnings,
    failures,
    boundaries: integrationBoundaries()
  };
}

export function summarizeDomains({ store, activePolicy = null }) {
  const linksByDomain = new Map();
  for (const link of store.links) {
    if (!linksByDomain.has(link.domain)) {
      linksByDomain.set(link.domain, []);
    }
    linksByDomain.get(link.domain).push(link);
  }
  const allowed = new Set(activePolicy?.allowed_domains ?? []);
  const blocked = new Set(activePolicy?.blocked_domains ?? []);
  const pending = new Set(activePolicy?.pending_review_domains ?? []);
  return [...linksByDomain.entries()].map(([domain, links]) => {
    let status = 'allowed';
    if (blocked.has(domain) || links.some((link) => link.status === 'domain_blocked')) {
      status = 'domain_blocked';
    } else if (pending.has(domain) || links.some((link) => link.status === 'pending_review')) {
      status = 'pending_review';
    } else if (activePolicy?.review_required_for_new_domains === true && !allowed.has(domain)) {
      status = 'pending_review';
    }
    return {
      domain,
      status,
      link_count: links.length,
      statuses: [...new Set(links.map((link) => link.status))].sort()
    };
  }).sort((a, b) => a.domain.localeCompare(b.domain));
}

export async function writeValidationMarkdown(filePath, report, title = 'Outbound Link Validation Report') {
  await fs.writeFile(filePath, renderValidationMarkdown(report, title), 'utf8');
}

export function renderValidationMarkdown(report, title = 'Outbound Link Validation Report') {
  const domainRows = (report.domains ?? []).map((domain) => `| ${domain.domain} | ${domain.status} | ${domain.link_count} |`).join('\n');
  return `# ${title}

Status: ${report.status}

| Metric | Count |
| --- | ---: |
| Links | ${report.summary.linkCount} |
| Instances | ${report.summary.instanceCount} |
| Policies | ${report.summary.policyCount} |
| Scan runs | ${report.summary.scanRunCount} |
| Audit logs | ${report.summary.auditLogCount} |
| Render decisions | ${report.summary.renderDecisionCount} |
| Warnings | ${report.summary.warningCount} |
| Failures | ${report.summary.failureCount} |

## Domains

| Domain | Status | Links |
| --- | --- | ---: |
${domainRows || '| none | none | 0 |'}

Boundary: local/offline integration output only. No live CMS/API/Azure calls, external crawling, live link checks, deployment, indexing, or live-page publication.
`;
}

export function integrationBoundaries() {
  return {
    local_only: true,
    backup_zip_created: false,
    external_http_crawling: false,
    live_http_checks: false,
    cms_api_calls: false,
    cms_writes: false,
    production_renderer_integration: false
  };
}

export async function writeJsonFiles(root, files) {
  for (const [relativePath, value] of Object.entries(files)) {
    await writeJson(path.join(root, relativePath), value);
  }
}

export function requiredFileFailures({ root, files, failures, basePath = '' }) {
  return Promise.all(files.map(async (file) => {
    try {
      await fs.access(path.join(root, file));
    } catch {
      failures.push({
        code: 'REQUIRED_INTEGRATION_FILE_MISSING',
        path: path.posix.join(basePath, file).replaceAll('\\', '/'),
        message: `${file} is required`
      });
    }
  }));
}

export function countBy(records, field) {
  const counts = {};
  for (const record of records ?? []) {
    const key = record[field] ?? 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function buildEmptyRenderDecisionsEnvelope(store) {
  return {
    schemaVersion: '0.3.0',
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    source_fixture: null,
    rendered_at: null,
    render_decisions: []
  };
}
