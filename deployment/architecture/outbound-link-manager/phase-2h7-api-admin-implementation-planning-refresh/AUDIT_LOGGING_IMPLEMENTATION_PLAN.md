# Audit Logging Implementation Plan

Audit logs must be append-only and tenant/site scoped.

## Audit Events

Planned event types:

- `link.status.changed`
- `instance.status.changed`
- `policy.updated`
- `scan.started`
- `scan.completed`
- `scan.failed`
- `bulk.preview.created`
- `bulk.executed`
- `backup.exported`
- `onboarding.exported`
- `tenant_bundle.exported`
- `restore.validation.simulated`

## Required Fields

Each audit entry should include:

- `id`
- `tenantId`
- `siteId`
- `actorType`
- `actorId`
- `action`
- `targetType`
- `targetId`
- `previousValue`
- `newValue`
- `reason`
- `correlationId`
- `operationId`
- `performedAt`

## Safety Rules

- Audit entries must not store bearer credentials, cookies, auth headers, protected config, connection strings, SAS URLs, storage keys, private keys, or raw environment values.
- Audit entries should store redacted summaries for large payloads.
- Bulk executions should create both one operation-level audit entry and target-level summary entries.
- Failed write attempts that pass authentication but fail policy gates should be audit-visible as denied operations.

