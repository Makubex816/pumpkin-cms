# Risks And Open Decisions

## Risks

| Risk | Mitigation |
| --- | --- |
| Tenant leakage through filters or ids | Tenant/site authorization before data load and provider-level tenant filters |
| Bulk action blast radius | Preview-before-execute, expected count, idempotency key, tenant hard-stop |
| Renderer behavior change | Separate renderer gate, static export diff, backup readiness |
| Migration drift between local JSON and Cosmos | Provider contract tests and migration dry-run packages |
| Audit log storing sensitive operational values | Redaction policy, safe summaries, negative tests |
| Live-readonly mode becoming write-capable by accident | Explicit mode gate and write endpoint hard-stops |
| Disabled state lost during backup/restore | Restore validation checks status and policy preservation |

## Open Decisions

- Whether final API paths should remain spec-style `/api/admin/outbound-links` with `tenantId` query parameters or use `/api/admin/{tenantId}/outbound-links` for consistency with some existing Admin endpoints.
- Whether OLM types belong first in Pumpkin API DTOs or a shared model package.
- Whether Cosmos uses dedicated OLM containers or an existing tenant-scoped content container.
- Whether render decisions are persisted or computed on demand from links, instances, and policies.
- Which role names map to the current auth claims and tenant assignments.
- How much audit history is exported in standard backups versus summarized.

