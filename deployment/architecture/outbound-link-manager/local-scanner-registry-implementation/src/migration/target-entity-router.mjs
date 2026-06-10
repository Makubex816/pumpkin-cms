export const migrationSchemaVersion = '0.1.0';
export const productionRecordSchemaVersion = '1.0.0';

export const productionEntities = [
  'outbound_links',
  'outbound_link_instances',
  'outbound_link_policies',
  'outbound_link_scan_runs',
  'outbound_link_audit_logs',
  'outbound_link_render_decisions',
  'outbound_link_review_decisions',
  'outbound_link_bulk_actions',
  'outbound_link_rollback_plans',
  'outbound_link_trace_logs'
];

export const productionRecordFiles = Object.freeze(Object.fromEntries(
  productionEntities.map((entity) => [entity, `production-records/${entity}.json`])
));

export function assertKnownEntity(entity) {
  if (!productionEntities.includes(entity)) {
    throw new Error(`unknown production entity: ${entity}`);
  }
}

export function recordFileForEntity(entity) {
  assertKnownEntity(entity);
  return productionRecordFiles[entity];
}

export function containerNameForEntity(profile, entity) {
  assertKnownEntity(entity);
  return profile.targetContainers?.[entity] ?? entity.replaceAll('_', '-');
}

export function emptyRecordCollections() {
  return Object.fromEntries(productionEntities.map((entity) => [entity, []]));
}
