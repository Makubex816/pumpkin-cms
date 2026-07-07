# Live Restore Adapter Gap

Status: documented.

Live restore is not implemented and was not approved for V2.8.61B.

Adapter gaps:

- Cosmos restore adapter for tenant-scoped entities.
- Sanitized identity restore and password reset workflow.
- Storage media copy/upload adapter with no key/SAS policy resolved.
- DomainBinding restore adapter that preserves pending/non-live state.
- Runtime rebuild and deploy adapter.
- Restore audit/BackupRun persistence.
- Rollback/abort model.
- Admin UI Backup Manager workflow.
- Secure handoff model for excluded secrets.

These are expected gaps and require a separate implementation approval.
