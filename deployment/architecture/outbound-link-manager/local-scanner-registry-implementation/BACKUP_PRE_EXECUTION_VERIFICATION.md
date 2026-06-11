# Backup Pre-Execution Verification

Before staging-simulated execution can pass validation, the apply-plan package must have:

- passed apply-plan validation
- passed Backup Center pre-migration check evidence
- rollback package integration evidence

The verifier writes:

```text
backup-pre-execution-verification.json
```

It does not create a live backup, export CMS data, download media, mutate storage, or call Azure.

