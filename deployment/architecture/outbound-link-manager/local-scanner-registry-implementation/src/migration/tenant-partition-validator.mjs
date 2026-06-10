import { productionEntities } from './target-entity-router.mjs';

export function validateTenantPartitions({ recordsByEntity, tenantKey, siteKey }) {
  const failures = [];
  for (const entity of productionEntities) {
    for (const record of recordsByEntity[entity] ?? []) {
      if (record.tenantKey !== tenantKey) {
        failures.push({
          code: 'TENANT_PARTITION_MISMATCH',
          entity,
          recordId: record.id ?? null,
          message: 'record tenantKey does not match migration tenant'
        });
      }
      if (record.siteKey !== siteKey) {
        failures.push({
          code: 'SITE_SCOPE_MISMATCH',
          entity,
          recordId: record.id ?? null,
          message: 'record siteKey does not match migration site'
        });
      }
      if (record.partitionKey !== tenantKey) {
        failures.push({
          code: 'PARTITION_KEY_MISMATCH',
          entity,
          recordId: record.id ?? null,
          message: 'record partitionKey must equal tenantKey'
        });
      }
    }
  }
  return failures;
}
