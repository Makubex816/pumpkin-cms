# Rollback Method Proposal

Proposed method name:

```text
first-write-batch-scoped-delete-or-restore-by-manifest
```

Required behavior:

- Tie rollback to `olbatch_b08e184fdc6565aa`.
- Identify only records written by the approved first-write batch.
- Abort on tenant/site mismatch.
- Abort on unapproved production target.
- Abort if Backup Center pre-write evidence is missing.
- Prefer restore-from-approved-backup where provider supports it.
- Otherwise permit only manifest-scoped deletion/restoration of the first-write records.
- Produce rollback evidence without secrets.

Current status: proposed, not executed.

This proposal supplies the future `OLM_STAGING_ROLLBACK_METHOD` value only after operator/provider approval.

