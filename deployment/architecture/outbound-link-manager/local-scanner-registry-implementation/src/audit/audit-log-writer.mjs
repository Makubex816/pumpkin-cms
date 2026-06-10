import { shortHash } from '../registry/registry-builder.mjs';
import { localStoreSchemaVersion } from '../store/store-files.mjs';

export function appendAuditLog(store, {
  action,
  recordType,
  recordId,
  actor = 'local-cli',
  reason = null,
  before = null,
  after = null,
  now = new Date()
}) {
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const log = {
    schemaVersion: localStoreSchemaVersion,
    id: `ola_${shortHash(`${store.tenant_id}|${store.site_id}|${timestamp}|${action}|${recordType}|${recordId}|${store.auditLogs.length}`)}`,
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    action,
    record_type: recordType,
    record_id: recordId,
    actor,
    reason,
    created_at: timestamp,
    mode: 'local-offline',
    before,
    after
  };

  return {
    ...store,
    auditLogs: [...store.auditLogs, log]
  };
}
