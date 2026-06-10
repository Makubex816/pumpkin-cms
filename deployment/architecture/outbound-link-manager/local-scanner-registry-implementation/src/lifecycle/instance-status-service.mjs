import { appendAuditLog } from '../audit/audit-log-writer.mjs';
import { instanceStatuses } from '../store/store-files.mjs';
import { cloneStore, readLocalStore } from '../store/local-store-reader.mjs';
import { writeLocalStore } from '../store/local-store-writer.mjs';

export async function setInstanceStatus({
  storePath,
  outputPath,
  instanceId,
  status,
  reason = null,
  overwrite = false,
  now = new Date()
}) {
  if (!instanceId) {
    throw new Error('--instance-id is required');
  }
  if (!instanceStatuses.has(status)) {
    throw new Error(`unknown instance status: ${status}`);
  }
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const store = cloneStore(await readLocalStore(storePath));
  const instance = store.instances.find((item) => item.id === instanceId);
  if (!instance) {
    throw new Error('no matching outbound link instance found');
  }
  const afterInstance = {
    ...instance,
    status,
    is_enabled: status === 'enabled',
    status_source: 'local-lifecycle',
    updated_at: timestamp,
    lifecycle_reason: reason
  };
  let nextStore = {
    ...store,
    instances: store.instances.map((item) => item.id === instance.id ? afterInstance : item)
  };
  nextStore = appendAuditLog(nextStore, {
    action: 'instance_status_changed',
    recordType: 'outbound_link_instance',
    recordId: instance.id,
    actor: 'local-cli',
    reason,
    before: {
      status: instance.status,
      is_enabled: instance.is_enabled
    },
    after: {
      status: afterInstance.status,
      is_enabled: afterInstance.is_enabled
    },
    now: timestamp
  });

  const outputRoot = await writeLocalStore({
    store: nextStore,
    outputPath,
    overwrite,
    now: timestamp
  });

  return {
    outputRoot,
    instance: afterInstance,
    auditLogCount: nextStore.auditLogs.length
  };
}
