# Backup Job Model Plan

## Job Record

`BackupJob` tracks one requested backup/validation/restore-plan operation.

Required fields:

- `jobId`
- `jobType`
- `mode`
- `scope`
- `requestedBy`
- `requestedAt`
- `status`
- `approvalRefs`
- `outputRoot`
- `retentionClass`
- `failureClass`

## Job Types

- `create_standard_backup`
- `validate_backup`
- `restore_plan`
- `create_escrow_backup`
- `escrow_restore_plan`
- `cleanup_expired`

## Phase 2F-3 Local Behavior

The first prototype can use local JSON job records written under `.tmp/jobs/`. It should not require a database or background queue yet.

## Later API Behavior

Future API/backend implementation should persist jobs in the Pumpkin backend and execute long-running work through a worker queue. Browser requests should enqueue and poll, not generate bundles synchronously.

## Failure Classes

- `schema_error`
- `checksum_error`
- `secret_scan_hit`
- `protected_path_hit`
- `approval_missing`
- `scope_error`
- `write_error`
- `validation_failed`
- `unsupported_adapter`
- `unexpected_error`
