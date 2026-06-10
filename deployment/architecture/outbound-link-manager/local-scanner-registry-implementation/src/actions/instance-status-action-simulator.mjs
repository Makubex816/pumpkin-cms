import { instanceStatuses } from '../store/store-files.mjs';
import { selectInstance } from './action-request-model.mjs';

export function simulateInstanceStatusAction({ store, request }) {
  const status = request.target.instanceStatus ?? request.target.status ?? request.payload.status;
  if (!instanceStatuses.has(status)) {
    throw new Error(`unknown instance status: ${status}`);
  }
  const instance = selectInstance(store, request.target);
  const updatedInstance = {
    ...instance,
    status,
    is_enabled: status === 'enabled',
    status_source: 'local-action-simulation',
    lifecycle_reason: request.reason,
    updated_at: request.now
  };
  const nextStore = {
    ...store,
    instances: store.instances.map((item) => item.id === instance.id ? updatedInstance : item)
  };
  return {
    nextStore,
    recordType: 'outbound_link_instance',
    recordId: instance.id,
    affectedLinkIds: [instance.outbound_link_id],
    affectedInstanceIds: [instance.id],
    changes: [{
      recordType: 'outbound_link_instance',
      recordId: instance.id,
      previousValue: { status: instance.status, is_enabled: instance.is_enabled },
      newValue: { status: updatedInstance.status, is_enabled: updatedInstance.is_enabled }
    }],
    before: { status: instance.status, is_enabled: instance.is_enabled },
    after: { status: updatedInstance.status, is_enabled: updatedInstance.is_enabled }
  };
}
