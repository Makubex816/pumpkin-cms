# Staging Readiness Plan

Before production persistence migration or staging write rehearsal, require:

1. Shared write contract lock across local package, Pumpkin API, and Admin UI.
2. Production persistence provider design for outbound links, instances, policies, scan runs, audit logs, and rollback plans.
3. Migration/backfill dry-run package with tenant isolation proof.
4. Staging-only provider profile that is separate from live production.
5. Readback validator for every write action.
6. Backup Center impact validation before and after write rehearsal.
7. Admin confirmation workflow with reason and approval reference capture.
8. Audit destination validation.
9. Rollback rehearsal against staging data.
10. Explicit owner signoff before any live-write-approved prompt.

Staging preflight must continue to block external crawling unless a separate crawler phase is approved.
