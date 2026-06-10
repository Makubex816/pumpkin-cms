import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpStorePath } from '../utils/safe-paths.mjs';
import { linkStatuses, instanceStatuses, localStoreFiles } from '../store/store-files.mjs';

const secretPatterns = [
  new RegExp(['Account', 'Key='].join(''), 'i'),
  new RegExp(['Shared', 'Access', 'Signature'].join(''), 'i'),
  /\bBearer\s+[A-Za-z0-9._-]{10,}/,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
  new RegExp(['-----BEGIN ', '[A-Z ]+', ' PRIVATE KEY-----'].join('')),
  new RegExp(['Default', 'Endpoints', 'Protocol='].join(''), 'i'),
  new RegExp(['\\bs', 'ig=', '[A-Za-z0-9%_-]{10,}'].join(''), 'i')
];

export async function validateLocalStore({ storePath, writeReport = true }) {
  const storeRoot = resolveTmpStorePath(storePath);
  const failures = [];
  const warnings = [];

  const manifest = await readRequiredJson(storeRoot, localStoreFiles.manifest, failures);
  const linksEnvelope = await readRequiredJson(storeRoot, localStoreFiles.links, failures);
  const instancesEnvelope = await readRequiredJson(storeRoot, localStoreFiles.instances, failures);
  const policiesEnvelope = await readRequiredJson(storeRoot, localStoreFiles.policies, failures);
  const scanRunsEnvelope = await readRequiredJson(storeRoot, localStoreFiles.scanRuns, failures);
  const auditLogsEnvelope = await readRequiredJson(storeRoot, localStoreFiles.auditLogs, failures);
  if (failures.length > 0) {
    return finalize({ storeRoot, failures, warnings, writeReport });
  }

  const tenantId = manifest.tenant_id;
  const siteId = manifest.site_id;
  const links = linksEnvelope.outbound_links ?? [];
  const instances = instancesEnvelope.outbound_link_instances ?? [];
  const policies = policiesEnvelope.outbound_link_policies ?? [];
  const scanRuns = scanRunsEnvelope.outbound_link_scan_runs ?? [];
  const auditLogs = auditLogsEnvelope.outbound_link_audit_logs ?? [];

  requireEnvelopeScope(linksEnvelope, tenantId, siteId, 'outbound-links.json', failures);
  requireEnvelopeScope(instancesEnvelope, tenantId, siteId, 'outbound-link-instances.json', failures);
  requireEnvelopeScope(policiesEnvelope, tenantId, siteId, 'outbound-link-policies.json', failures);
  requireEnvelopeScope(scanRunsEnvelope, tenantId, siteId, 'outbound-link-scan-runs.json', failures);
  requireEnvelopeScope(auditLogsEnvelope, tenantId, siteId, 'outbound-link-audit-logs.json', failures);

  const linkIds = new Set();
  const normalizedKeys = new Set();
  for (const link of links) {
    validateScopedRecord(link, tenantId, siteId, `link:${link.id}`, failures);
    requireField(link, 'id', 'OUTBOUND_LINK_ID_MISSING', failures);
    requireField(link, 'normalized_url', 'NORMALIZED_URL_MISSING', failures);
    requireField(link, 'domain', 'DOMAIN_MISSING', failures);
    if (!linkStatuses.has(link.status)) {
      failures.push({ code: 'OUTBOUND_LINK_STATUS_INVALID', path: `outbound-links.json:${link.id}`, message: `invalid link status ${link.status}` });
    }
    if (!/^https?:\/\//i.test(link.normalized_url ?? '')) {
      failures.push({ code: 'NON_WEB_LINK_CLASSIFIED', path: `outbound-links.json:${link.id}`, message: 'normalized URL is not http/https' });
    }
    if (!link.last_detected_at && link.status !== 'archived') {
      failures.push({ code: 'LINK_LAST_DETECTED_AT_MISSING', path: `outbound-links.json:${link.id}`, message: 'merged links must track last_detected_at' });
    }
    const duplicateKey = `${link.tenant_id}|${link.site_id}|${link.normalized_url}`;
    if (normalizedKeys.has(duplicateKey)) {
      failures.push({ code: 'DUPLICATE_NORMALIZED_URL', path: `outbound-links.json:${link.id}`, message: 'duplicate normalized URL in tenant/site registry' });
    }
    normalizedKeys.add(duplicateKey);
    linkIds.add(link.id);
  }

  for (const instance of instances) {
    validateScopedRecord(instance, tenantId, siteId, `instance:${instance.id}`, failures);
    requireField(instance, 'id', 'INSTANCE_ID_MISSING', failures);
    requireField(instance, 'outbound_link_id', 'INSTANCE_LINK_ID_MISSING', failures);
    requireField(instance, 'location_path', 'INSTANCE_LOCATION_PATH_MISSING', failures);
    if (!instanceStatuses.has(instance.status)) {
      failures.push({ code: 'INSTANCE_STATUS_INVALID', path: `outbound-link-instances.json:${instance.id}`, message: `invalid instance status ${instance.status}` });
    }
    if (!linkIds.has(instance.outbound_link_id)) {
      failures.push({ code: 'INSTANCE_LINK_REFERENCE_MISSING', path: `outbound-link-instances.json:${instance.id}`, message: 'instance references missing outbound link' });
    }
    if (instance.status === 'stale' && instance.is_enabled !== false) {
      failures.push({ code: 'STALE_INSTANCE_ENABLED', path: `outbound-link-instances.json:${instance.id}`, message: 'stale instances must be disabled' });
    }
  }

  for (const policy of policies) {
    validateScopedRecord(policy, tenantId, siteId, `policy:${policy.id}`, failures);
    requireField(policy, 'id', 'POLICY_ID_MISSING', failures);
    validateDomainArray(policy.allowed_domains, `policy:${policy.id}:allowed_domains`, failures);
    validateDomainArray(policy.blocked_domains, `policy:${policy.id}:blocked_domains`, failures);
    validateDomainArray(policy.pending_review_domains, `policy:${policy.id}:pending_review_domains`, failures);
  }

  for (const scanRun of scanRuns) {
    validateScopedRecord(scanRun, tenantId, siteId, `scanRun:${scanRun.id}`, failures);
    requireField(scanRun, 'id', 'SCAN_RUN_ID_MISSING', failures);
  }

  for (const auditLog of auditLogs) {
    validateScopedRecord(auditLog, tenantId, siteId, `auditLog:${auditLog.id}`, failures);
    requireField(auditLog, 'id', 'AUDIT_LOG_ID_MISSING', failures);
    requireField(auditLog, 'action', 'AUDIT_ACTION_MISSING', failures);
    requireField(auditLog, 'record_type', 'AUDIT_RECORD_TYPE_MISSING', failures);
  }

  const activePolicy = policies.find((policy) => policy.id === policiesEnvelope.active_policy_id);
  if (!activePolicy) {
    failures.push({ code: 'ACTIVE_POLICY_MISSING', path: 'outbound-link-policies.json', message: 'active policy id does not reference a policy' });
  } else {
    validateBlockedDomainEffects({ links, instances, activePolicy, failures });
  }

  scanSecretLikeValues({
    manifest,
    linksEnvelope,
    instancesEnvelope,
    policiesEnvelope,
    scanRunsEnvelope,
    auditLogsEnvelope
  }, failures);

  return finalize({
    storeRoot,
    failures,
    warnings,
    writeReport,
    links,
    instances,
    policies,
    scanRuns,
    auditLogs
  });
}

async function readRequiredJson(storeRoot, fileName, failures) {
  try {
    return await readJson(path.join(storeRoot, fileName));
  } catch (error) {
    failures.push({ code: 'REQUIRED_STORE_JSON_MISSING_OR_INVALID', path: fileName, message: error.message });
    return null;
  }
}

function requireEnvelopeScope(envelope, tenantId, siteId, pathName, failures) {
  if (envelope.tenant_id !== tenantId || envelope.site_id !== siteId) {
    failures.push({ code: 'STORE_ENVELOPE_SCOPE_MISMATCH', path: pathName, message: 'envelope scope does not match manifest' });
  }
}

function validateScopedRecord(record, tenantId, siteId, pathName, failures) {
  if (record.tenant_id !== tenantId) {
    failures.push({ code: 'TENANT_SCOPE_MISMATCH', path: pathName, message: 'record tenant does not match store tenant' });
  }
  if (record.site_id !== siteId) {
    failures.push({ code: 'SITE_SCOPE_MISMATCH', path: pathName, message: 'record site does not match store site' });
  }
}

function requireField(record, field, code, failures) {
  if (record[field] === undefined || record[field] === null || record[field] === '') {
    failures.push({ code, path: field, message: `${field} is required` });
  }
}

function validateDomainArray(value, pathName, failures) {
  if (!Array.isArray(value)) {
    failures.push({ code: 'POLICY_DOMAIN_LIST_INVALID', path: pathName, message: 'policy domain list must be an array' });
    return;
  }
  for (const domain of value) {
    if (typeof domain !== 'string' || domain !== domain.toLowerCase() || domain.includes('://')) {
      failures.push({ code: 'POLICY_DOMAIN_INVALID', path: pathName, message: `invalid policy domain ${domain}` });
    }
  }
}

function validateBlockedDomainEffects({ links, instances, activePolicy, failures }) {
  const blockedDomains = new Set(activePolicy.blocked_domains ?? []);
  const blockedLinkIds = new Set();
  for (const link of links) {
    if (!blockedDomains.has(link.domain) || link.status === 'disabled' || link.status === 'archived') {
      continue;
    }
    blockedLinkIds.add(link.id);
    if (link.status !== 'domain_blocked') {
      failures.push({ code: 'BLOCKED_DOMAIN_POLICY_NOT_APPLIED', path: `outbound-links.json:${link.id}`, message: 'blocked domain link must be domain_blocked' });
    }
  }
  for (const instance of instances) {
    if (blockedLinkIds.has(instance.outbound_link_id) && instance.status === 'enabled') {
      failures.push({ code: 'BLOCKED_DOMAIN_INSTANCE_ENABLED', path: `outbound-link-instances.json:${instance.id}`, message: 'instance for blocked domain cannot remain enabled' });
    }
  }
}

function scanSecretLikeValues(value, failures, pathName = '$') {
  if (value === null || value === undefined) {
    return;
  }
  if (typeof value === 'string') {
    if (secretPatterns.some((pattern) => pattern.test(value))) {
      failures.push({ code: 'SECRET_LIKE_VALUE_DETECTED', path: pathName, message: 'secret-like value detected in local store' });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanSecretLikeValues(item, failures, `${pathName}[${index}]`));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      scanSecretLikeValues(nested, failures, `${pathName}.${key}`);
    }
  }
}

async function finalize({
  storeRoot,
  failures,
  warnings,
  writeReport,
  links = [],
  instances = [],
  policies = [],
  scanRuns = [],
  auditLogs = []
}) {
  const result = {
    schemaVersion: '0.2.0',
    validator: 'pumpkin-outbound-link-local-store-validator',
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      linkCount: links.length,
      instanceCount: instances.length,
      policyCount: policies.length,
      scanRunCount: scanRuns.length,
      auditLogCount: auditLogs.length,
      disabledLinkCount: links.filter((link) => link.status === 'disabled').length,
      pendingReviewLinkCount: links.filter((link) => link.status === 'pending_review').length,
      domainBlockedLinkCount: links.filter((link) => link.status === 'domain_blocked').length,
      staleInstanceCount: instances.filter((instance) => instance.status === 'stale').length,
      warningCount: warnings.length,
      failureCount: failures.length
    },
    warnings,
    failures,
    boundaries: {
      outputUnderTmp: true,
      externalHttpCrawling: false,
      cmsApiCalls: false,
      cmsWrites: false,
      protectedConfigReads: false
    }
  };
  if (writeReport) {
    await writeJson(path.join(storeRoot, localStoreFiles.validationJson), result);
    await fs.writeFile(path.join(storeRoot, localStoreFiles.validationMd), renderValidationMarkdown(result), 'utf8');
  }
  return result;
}

function renderValidationMarkdown(result) {
  return `# Local Store Validation Result

Status: ${result.status}

| Metric | Count |
| --- | ---: |
| Links | ${result.summary.linkCount} |
| Instances | ${result.summary.instanceCount} |
| Policies | ${result.summary.policyCount} |
| Scan runs | ${result.summary.scanRunCount} |
| Audit logs | ${result.summary.auditLogCount} |
| Failures | ${result.summary.failureCount} |

Boundaries: local-only validation, no external HTTP crawling, no CMS/API calls, no CMS writes, and no protected config reads.
`;
}
