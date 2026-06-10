# Database Migration And Provider Strategy

No database migration is approved in Phase 2H-7.

## Provider Strategy

Future implementation should support three providers behind one service contract:

| Provider | Purpose | Write behavior |
| --- | --- | --- |
| Local JSON provider | Preserve local/offline development and fixture workflows | local-only writes under approved output roots |
| In-memory provider | Unit and API contract tests | test-only |
| Cosmos provider | Future production persistence | read-only first, write-approved later |

## Cosmos Considerations

If Cosmos is used, every document must carry:

- `id`
- `tenantKey`
- `tenantId`
- `siteId`
- `schemaVersion`
- `entityType`
- entity-specific fields
- `createdAt`
- `updatedAt`

Partition key:

- Preferred: `/tenantKey`

Suggested containers:

- `outboundLinks`
- `outboundLinkInstances`
- `outboundLinkPolicies`
- `outboundLinkScanRuns`
- `outboundLinkAuditLogs`

Alternative:

- A shared CMS content container can be considered only if the provider already has tenant-key indexing, entity-type filtering, and backup/restore compatibility.

## Migration Sequence

1. Implement local provider and API contract models.
2. Implement read-only API endpoints using local/fake provider.
3. Draft Cosmos document schemas and indexing policies.
4. Create migration dry-run package from local fixture data.
5. Validate tenant isolation, `/tenantKey` partitioning, unique normalized URL behavior, ETag conflicts, and restore compatibility.
6. Run backup readiness check before any live migration.
7. Request explicit approval for live migration or write-capable persistence.

## Data Integrity Rules

- One normalized URL per tenant/site creates one link registry record.
- Each placement creates one instance record.
- Prior disabled instance state survives re-scan.
- Missing prior instances become `stale`, not deleted.
- Audit logs are append-only.
- Restore must not automatically re-enable disabled links or instances.

