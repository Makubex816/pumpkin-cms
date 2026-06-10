# Backup Before Migration

The migration dry-run writes `BACKUP_BEFORE_MIGRATION_REQUIREMENTS.md` and `.json`. These files define required evidence before any future staging or production persistence attempt.

Required before any future migration execution:

- complete tenant standard backup candidate
- outbound-link backup files from the local/offline store
- checksum manifest
- restore-plan validation
- Resource Registry snapshot
- candidate migration manifest review
- rollback package review
- operator summary
- owner signoff

The dry-run does not create, upload, export, or mutate live backups. It only records the evidence that must exist before a later approval can cross into staging persistence.
