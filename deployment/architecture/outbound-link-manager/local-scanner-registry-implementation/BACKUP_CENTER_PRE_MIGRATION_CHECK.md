# Backup Center Pre-Migration Check

Phase 2H-19 verifies that the migration dry-run package contains the Backup Center pre-migration evidence produced by Phase 2H-17.

The apply-plan dry-run expects:

- Backup Center requirements file
- migration manifest
- checksums
- rollback package
- local/offline provider boundaries

The check is local and read-only. It does not run a live backup, export CMS data, download media, call Azure, or mutate storage.

