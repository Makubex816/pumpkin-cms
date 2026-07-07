# V2.8.61A Backup Manager Export Report

Status: completed.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `backup_manager_package_export_airstrip_full_backup_no_domain_no_post`.

Tenant: `airstrip-club-las-vegas`.

Completed at: `2026-07-06T20:34:31-04:00`.

## V2.8.60X Carryforward

- Airstrip production default-host repair was completed.
- Production default host remained `https://app-airstrip-prod-centralus-001.azurewebsites.net`.
- Production responsive replay passed 28/28 checks with zero overflow.
- Custom domain cutover, DNS, and indexing remained pending separate approval.

## Implementation Result

V2.8.61A added a local operator exporter:

`deployment/architecture/pumpkin-platform/backup-manager-export/v2-8-61a/airstrip-backup-export.mjs`

No Pumpkin API source change or API deploy was required. The exporter used existing authenticated read routes for Tenant, Page, MediaAsset, Theme, FormDefinition, FormEntry, ImportRun, PublishRun, DomainBinding, and sanitized User export.

## Backup Bundle Result

Protected output path:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61a-airstrip-full-backup-proof`

Bundle status: passed.

- Files: 62.
- Total bytes: 8,149,978.
- Checksum entries: 61.
- Checksum validation failures: 0.
- Manifest SHA-256: `2D342D417C557E1642F470CDFD3808C2CA7A752A7D82B7BA341291BFB80144C1`.
- `checksums.sha256` SHA-256: `23F85668A07846D8F20E1DE5C8276F3D70C66C7617FBBA0B00E25E7F2ADE6655`.

## Export Summary

| Domain | Count |
| --- | ---: |
| Pages | 5 |
| MediaAsset records | 13 |
| Media blobs downloaded | 13 |
| Themes | 1 |
| FormDefinitions | 1 |
| FormEntries | 0 |
| ImportRuns | 0 |
| PublishRuns | 0 |
| DomainBindings | 1 |
| Users, sanitized | 1 |
| BackupRuns | 0 |

Expected Airstrip checks passed: 5 pages, 13 media assets/blobs, and active `airstrip-reservation` FormDefinition.

## Runtime No-Regression

GET-only runtime no-regression passed 17/17.

No contact POST, form submission, media upload/delete, content write, DNS/custom-domain mutation, indexing action, appsetting mutation, storage key/listKeys/SAS generation, connection-string generation, Key Vault read, Pumpkin API deploy, or Admin UI deploy occurred.

The approved Admin login was used for read-only export authentication. Source behavior may update the authenticated user's `lastLogin`; no disallowed tenant/content/resource mutation was performed.

## Files

- Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-61a-backup-manager-export-result/`
- Durable export implementation doc: `deployment/architecture/pumpkin-platform/PUMPKIN_BACKUP_MANAGER_EXPORT_IMPLEMENTATION_V2_8_61A.md`
- Durable Airstrip backup proof doc: `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_FULL_BACKUP_PROOF_V2_8_61A.md`
- Durable restore readiness doc: `deployment/architecture/pumpkin-platform/PUMPKIN_BACKUP_RESTORE_READINESS_V2_8_61A.md`

## Next Phase

The next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-61a-backup-manager-export-result/next-phase-prompt.md`
