import crypto from 'node:crypto';

export function stableJson(value) {
  return JSON.stringify(sortObject(value));
}

export function hashValue(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : stableJson(value)).digest('hex');
}

export function shortHash(value, length = 16) {
  return hashValue(value).slice(0, length);
}

export function deterministicId(prefix, parts, length = 16) {
  return `${prefix}_${shortHash(parts.map((part) => String(part ?? 'null')).join('|'), length)}`;
}

export function createMigrationRunId({ tenantKey, siteKey, profile }) {
  return profile.migrationRunId
    ?? deterministicId('olmr', [tenantKey, siteKey, profile.profileName, profile.providerMode, profile.schemaVersion], 16);
}

export function targetRecordIdFor({ entity, tenantKey, siteKey, sourceRecordId }) {
  return deterministicId(entityPrefix(entity), [entity, tenantKey, siteKey, sourceRecordId], 16);
}

export function migrationRecordIdFor({ migrationRunId, entity, sourceRecordId }) {
  return deterministicId('olmrec', [migrationRunId, entity, sourceRecordId], 18);
}

export function migrationTraceIdFor({ migrationRunId, entity, sourceRecordId }) {
  return deterministicId('olmtrace', [migrationRunId, entity, sourceRecordId], 18);
}

export function stateHash(value) {
  return `sha256:${hashValue(value)}`;
}

export function finalizeCandidateRecord({ record, sourceRecord }) {
  const beforeStateHash = stateHash(sourceRecord ?? {});
  const afterStateHash = stateHash(record);
  const withStateHashes = {
    ...record,
    beforeStateHash,
    afterStateHash
  };
  return {
    ...withStateHashes,
    migrationRecordHash: stateHash(withStateHashes)
  };
}

function entityPrefix(entity) {
  const prefixes = {
    outbound_links: 'olp',
    outbound_link_instances: 'olip',
    outbound_link_policies: 'olpp',
    outbound_link_scan_runs: 'olsrp',
    outbound_link_audit_logs: 'olap',
    outbound_link_render_decisions: 'olrdp',
    outbound_link_review_decisions: 'olrvp',
    outbound_link_bulk_actions: 'olbp',
    outbound_link_rollback_plans: 'olrbp',
    outbound_link_trace_logs: 'oltp'
  };
  return prefixes[entity] ?? 'olp';
}

function sortObject(value) {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((accumulator, key) => {
      accumulator[key] = sortObject(value[key]);
      return accumulator;
    }, {});
  }
  return value;
}
