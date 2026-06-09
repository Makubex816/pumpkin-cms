# Complete Standard Backup Result

Date: 2026-06-09

Complete candidate bundle path:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/ice-full-standard-backup-complete/`

## Candidate Contents

- `manifest.json`
- `checksums.sha256`
- `BACKUP_SUMMARY.md`
- `VALIDATION_RESULT.md`
- `validation-result.json`
- `RESTORE_INSTRUCTIONS.md`
- `cms-content/`
- `database/`
- `media/`
- `static/`
- `config-inventory/`
- `escrow/ESCROW_NOT_INCLUDED.md`

## Component Status

| Component | Status |
| --- | --- |
| CMS content | `included` |
| Database | `not_included_no_approved_export_tooling_or_env` |
| Media | `metadata_inventory_included_blob_copies_not_included` |
| Static evidence | `included_from_local_artifacts_and_safe_reports` |
| Config inventory | `redacted_presence_only` |
| Escrow | `not_included_standard_backup` |

## Counts

| Inventory | Count |
| --- | ---: |
| Tenants | 1 |
| Sites | 1 |
| Pages | 3 |
| Routes | 5 |
| Forms | 3 |
| SEO entries | 3 |
| Redirects | 0 |
| Theme settings | 1 |
| Media assets | 12 |
| Static evidence routes | 5 |
| Config variables | 11 |

The candidate is valid as a standard backup baseline plus Phase 2F-10 blocker evidence. It is not complete production restore proof.

