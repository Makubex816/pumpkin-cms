import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpScanPath } from '../utils/safe-paths.mjs';

const linkStatuses = new Set(['active', 'disabled', 'pending_review', 'domain_blocked', 'stale', 'broken_unverified', 'archived']);
const instanceStatuses = new Set(['enabled', 'disabled', 'hidden', 'plain_text', 'fallback', 'pending_review', 'stale']);

export async function validateScanOutput({ scanPath, writeReport = true }) {
  const outputRoot = resolveTmpScanPath(scanPath);
  const failures = [];
  const warnings = [];

  const linksEnvelope = await readRequiredJson(outputRoot, 'outbound-links.json', failures);
  const instancesEnvelope = await readRequiredJson(outputRoot, 'outbound-link-instances.json', failures);
  const scanRun = await readRequiredJson(outputRoot, 'outbound-link-scan-run.json', failures);
  if (failures.length > 0) {
    return finalize({ outputRoot, failures, warnings, writeReport });
  }

  const links = linksEnvelope.outbound_links ?? [];
  const instances = instancesEnvelope.outbound_link_instances ?? [];
  const linkIds = new Set();
  const normalizedKeys = new Set();

  for (const link of links) {
    requireField(link, 'id', 'OUTBOUND_LINK_ID_MISSING', failures);
    requireField(link, 'tenant_id', 'TENANT_SCOPE_MISSING', failures);
    requireField(link, 'site_id', 'SITE_SCOPE_MISSING', failures);
    requireField(link, 'original_url', 'ORIGINAL_URL_MISSING', failures);
    requireField(link, 'normalized_url', 'NORMALIZED_URL_MISSING', failures);
    requireField(link, 'domain', 'DOMAIN_MISSING', failures);
    if (!linkStatuses.has(link.status)) {
      failures.push({ code: 'OUTBOUND_LINK_STATUS_INVALID', path: `outbound-links.json:${link.id}`, message: `invalid link status ${link.status}` });
    }
    if (!/^https?:\/\//i.test(link.normalized_url ?? '')) {
      failures.push({ code: 'NON_WEB_LINK_CLASSIFIED', path: `outbound-links.json:${link.id}`, message: 'normalized URL is not http/https' });
    }
    if ((link.original_url ?? '').startsWith('/')) {
      failures.push({ code: 'RELATIVE_LINK_CLASSIFIED', path: `outbound-links.json:${link.id}`, message: 'relative link was classified as outbound' });
    }
    const duplicateKey = `${link.tenant_id}|${link.site_id}|${link.normalized_url}`;
    if (normalizedKeys.has(duplicateKey)) {
      failures.push({ code: 'DUPLICATE_NORMALIZED_URL', path: `outbound-links.json:${link.id}`, message: 'duplicate normalized URL in tenant/site registry' });
    }
    normalizedKeys.add(duplicateKey);
    linkIds.add(link.id);
  }

  for (const instance of instances) {
    requireField(instance, 'id', 'INSTANCE_ID_MISSING', failures);
    requireField(instance, 'tenant_id', 'INSTANCE_TENANT_SCOPE_MISSING', failures);
    requireField(instance, 'site_id', 'INSTANCE_SITE_SCOPE_MISSING', failures);
    requireField(instance, 'outbound_link_id', 'INSTANCE_LINK_ID_MISSING', failures);
    requireField(instance, 'location_path', 'INSTANCE_LOCATION_PATH_MISSING', failures);
    if (!instanceStatuses.has(instance.status)) {
      failures.push({ code: 'INSTANCE_STATUS_INVALID', path: `outbound-link-instances.json:${instance.id}`, message: `invalid instance status ${instance.status}` });
    }
    if (!linkIds.has(instance.outbound_link_id)) {
      failures.push({ code: 'INSTANCE_LINK_REFERENCE_MISSING', path: `outbound-link-instances.json:${instance.id}`, message: 'instance references missing outbound link' });
    }
  }

  if (scanRun.tenant_id !== linksEnvelope.tenant_id || scanRun.site_id !== linksEnvelope.site_id) {
    failures.push({ code: 'SCAN_RUN_SCOPE_MISMATCH', path: 'outbound-link-scan-run.json', message: 'scan run scope does not match registry scope' });
  }

  return finalize({ outputRoot, failures, warnings, writeReport, links, instances, scanRun });
}

async function readRequiredJson(outputRoot, fileName, failures) {
  try {
    return await readJson(path.join(outputRoot, fileName));
  } catch (error) {
    failures.push({ code: 'REQUIRED_JSON_MISSING_OR_INVALID', path: fileName, message: error.message });
    return null;
  }
}

function requireField(record, field, code, failures) {
  if (record[field] === undefined || record[field] === null || record[field] === '') {
    failures.push({ code, path: field, message: `${field} is required` });
  }
}

async function finalize({ outputRoot, failures, warnings, writeReport, links = [], instances = [], scanRun = null }) {
  const result = {
    schemaVersion: '0.1.0',
    validator: 'pumpkin-outbound-link-local-validator',
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      linkCount: links.length,
      instanceCount: instances.length,
      staleInstanceCount: instances.filter((instance) => instance.status === 'stale').length,
      scanRunStatus: scanRun?.status ?? null,
      warningCount: warnings.length,
      failureCount: failures.length
    },
    warnings,
    failures,
    boundaries: {
      outputUnderTmp: true,
      externalHttpCrawling: false,
      cmsApiCalls: false,
      cmsWrites: false
    }
  };
  if (writeReport) {
    await writeJson(path.join(outputRoot, 'VALIDATION_RESULT.json'), result);
  }
  return result;
}
