# Cosmos Or Provider Mapping Options

Production persistence can use Cosmos DB NoSQL or another provider behind the same interface.

Preferred Cosmos option:

- one container per entity family
- partition key: `/tenantKey`
- required secondary filter fields: `siteKey`, `entityType`, `domain`, `status`, `updatedAt`
- deterministic IDs generated before migration execution
- no cross-tenant batch writes

Candidate containers:

- `outbound-links`
- `outbound-link-instances`
- `outbound-link-policies`
- `outbound-link-scan-runs`
- `outbound-link-audit-logs`
- `outbound-link-render-decisions`
- `outbound-link-review-decisions`
- `outbound-link-bulk-actions`
- `outbound-link-rollback-plans`
- `outbound-link-trace-logs`

Alternative compact option:

- single `outbound-link-governance` container
- partition key: `/tenantKey`
- `entityType` discriminator
- suitable for smaller tenants and simpler backup export
- requires stricter query filters and indexing review

Provider-neutral option:

- same contract can map to relational tables or document storage
- provider must support tenant partitioning, idempotent upserts, transactional or stop-on-conflict write batches, and readback validation

No live provider is selected or configured in this phase.
