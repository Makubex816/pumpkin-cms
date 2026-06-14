# Fallback Error Degraded State Result

Fallback behavior is implemented through:

- `getAuditJobLedgerAdminApiSnapshotWithFallback`;
- `getAuditJobLedgerAdminFallbackSnapshot`;
- `AuditJobLedgerAdminApiFallback`;
- component state `fixture`, `loading`, `api`, and `fallback`;
- UI text for fallback reason.

Fallback triggers include missing auth, API availability failure, non-200 status, invalid JSON, envelope contract failure, unsupported provider mode, open write flags, or meta write-boundary flags.

Fallback result:

- visible Admin provider remains fixture-backed;
- attempted provider mode is recorded as `admin-api-readonly`;
- future actions stay disabled;
- no mutation UI or handler is enabled.
