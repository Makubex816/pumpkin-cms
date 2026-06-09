# Restore Plan Output Result

Generated restore-plan output is written only under ignored `.tmp`.

Output structure:

```text
<restore-output>/
  restore-plan.json
  RESTORE_PLAN.md
  RESTORE_VALIDATION_RESULT.json
  RESTORE_VALIDATION_RESULT.md
  RESTORE_TARGET_NOT_WRITTEN.md
```

The reports include dry-run status, source bundle path, validation summary, inventory counts, count comparison, planned non-writing steps, failures if any, and explicit security boundaries.

`RESTORE_TARGET_NOT_WRITTEN.md` confirms no database, CMS, media, static, secret, escrow, external system, or live-page target was written.
