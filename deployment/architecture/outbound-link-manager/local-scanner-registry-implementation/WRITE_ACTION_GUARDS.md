# Write Action Guards

Phase 2H-8 implements write-action guard stubs only.

Implemented guard methods:

- `requestSetLinkStatus`
- `requestSetInstanceStatus`
- `requestSetPolicy`
- `requestCreateScanRun`
- `requestBulkAction`

All write-action guard methods return:

- `ok: false`
- `status: 403`
- `code: OUTBOUND_LINK_WRITE_NOT_APPROVED`
- `meta.writeApproved: false`
- `meta.localStoreMutation: false`

No local store mutation happens through these API guard methods in Phase 2H-8.

Future write-capable phases must add explicit approvals, preview output, reason text, audit logging, tenant isolation, ETag/conflict handling, backup readiness, and rollback/readback plans.

