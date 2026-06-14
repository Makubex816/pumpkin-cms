# Trace Audit Rollback Result

Result: planned references present; no write trace/audit/rollback execution occurred.

Carryforward references:

- Rollback plan ID: `rollback:v2-8-17d-production-rollback-plan`.
- Readback plan ID: `readback-ice-rink-rentals-carryforward-v2-11-2-future-import`.
- Audit trace ID: `audit-trace-ice-rink-rentals-carryforward-v2-11-2-v2-11-6`.
- No-go condition result ID: `no-go-ice-rink-rentals-carryforward-v2-11-2-v2-11-6`.

Because the import did not execute:

- No execution run ID was created.
- No audit event was persisted.
- No rollback action was invoked.
- No readback comparison was recorded.
- No entity IDs were created or updated.

