# Standard Backup Bundle Result

Date: 2026-06-09

Bundle path:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/ice-full-standard-backup/`

The bundle is a local folder-format standard backup under ignored `.tmp` output. It is not a production zip archive and must not be staged into Git.

## Manifest Status

| Field | Value |
| --- | --- |
| Manifest version | `0.2.0` |
| Bundle contract version | `0.2.0` |
| Validator contract version | `0.2.0` |
| Backup mode | `standard` |
| Source | `real-ice-readonly-standard` |
| Tenant key | `ice-rink-rentals` |
| Site key | `ice-rink-rentals` |
| Includes escrow | `false` |
| Checksum algorithm | `sha256` |
| Content file count | 19 |

## Top-Level Contents

- `BACKUP_SUMMARY.md`
- `RESTORE_INSTRUCTIONS.md`
- `VALIDATION_RESULT.md`
- `checksums.sha256`
- `manifest.json`
- `validation-result.json`
- `cms-content/`
- `config-inventory/`
- `database/`
- `escrow/`
- `media/`
- `static/`

## Component Status

| Component | Status |
| --- | --- |
| CMS content | `included` |
| Database | `not_included_no_approved_export_tooling_or_env` |
| Media | `metadata_inventory_included_blob_copies_not_included` |
| Static evidence | `included_from_local_artifacts_and_safe_reports` |
| Config inventory | `redacted_presence_only` |
| Escrow | `not_included_standard_backup` |

