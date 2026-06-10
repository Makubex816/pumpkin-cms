# Production Persistence Strategy

The production persistence layer should be provider-based, with local/offline as the default profile.

Provider interfaces:

- `OutboundLinkReadProvider`
- `OutboundLinkWriteProvider`
- `OutboundLinkMigrationProvider`
- `OutboundLinkTraceAuditProvider`
- `OutboundLinkBackupExportProvider`

Required profiles:

- `local-dev`: fixture and local `.tmp` development
- `fake-provider`: deterministic unit/integration tests
- `offline-bundle`: tenant package validation without live services
- `local-file-backed`: file store over local generated data
- `local-api-fake-provider`: Admin/API write workflow tests
- `live-readonly`: explicit production readback and inventory, no writes
- `live-write-approved`: future write profile, blocked until all gates pass
- `production-runtime`: future runtime read profile for renderer/API after migration approval

Provider strategy:

1. Keep local/fake providers as first-class code paths.
2. Add production read provider only after Resource Registry and credentials are represented as references without values.
3. Add migration dry-run provider before any production write provider.
4. Add live-write provider only after backup, rollback, staging, browser QA, and owner approval are complete.
5. Preserve shared DTOs and trace contracts across all profiles.

Live-write-approved must remain disabled by default.
