# Pumpkin Backup Live Restore Adapter Gaps V2.8.61B

Status: documented.

V2.8.61B did not implement or execute live restore. The dry-run identifies the following adapter gaps before any live restore can be approved:

- Cosmos tenant-scoped restore adapter.
- Storage media restore adapter.
- Sanitized identity restore and password reset workflow.
- Secret handoff/reset workflow for excluded values.
- DomainBinding pending/non-live restore adapter.
- Runtime rebuild/deploy adapter.
- Restore audit/BackupRun persistence.
- Rollback and abort model.
- Admin UI Backup Manager intake and approval workflow.
- Isolated preview host metadata capture for Airstrip restore rehearsal.

These gaps require a separate implementation approval and must remain no-live-mutation until explicitly authorized.
