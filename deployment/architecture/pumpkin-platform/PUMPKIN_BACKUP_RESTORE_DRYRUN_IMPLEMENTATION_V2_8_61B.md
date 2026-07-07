# Pumpkin Backup Restore Dry-Run Implementation V2.8.61B

Status: implemented.

Tool:

`deployment/architecture/pumpkin-platform/backup-manager-restore/v2-8-61b/tenant-backup-restore-dryrun.mjs`

Purpose:

- Validate a protected tenant backup bundle.
- Validate manifest and checksums.
- Parse database exports.
- Validate media manifest and local media files.
- Validate website restore inputs.
- Validate resource and DomainBinding metadata.
- Generate a dry-run restore order plan.
- Generate outside-repo dry-run reports and checksums.

The tool is local/operator scoped and performs no live restore, deploy, DNS, media upload, database write, appsetting mutation, or secret recovery.
