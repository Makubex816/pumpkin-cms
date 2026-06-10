# Bulk Action QA Result

Bulk action scenarios:

- bulk domain disable with approval reference: passed and applied in local/fake mode
- bulk domain disable without approval reference: blocked

Approved bulk evidence:

- provider mode: `local-api-fake-provider`
- code: `OK`
- audit IDs present
- rollback ID present
- affected pages present
- affected instances present
- publishing impact summary present

Blocked bulk evidence:

- provider mode: `local-api-fake-provider`
- code: `OUTBOUND_LINK_WRITE_NOT_APPROVED`
- block reason: `APPROVAL_REFERENCE_REQUIRED`
- rollback ID present
- before/after hashes present
