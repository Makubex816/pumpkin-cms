# Pumpkin Tenant Backup Coverage Matrix V2.8.52A

## Classification

`protected_backup_bundle_created_with_restore_gaps`

## Coverage

| Domain | Status | Count | Notes |
| --- | --- | ---: | --- |
| Tenant summary | Covered redacted | 1 | Secret-like tenant fields redacted. |
| Pages | Covered | 3 | Admin API read-only export. |
| MediaAssets | Covered | 9 | Admin API read-only export. |
| Media binaries | Covered | 9 | 22,639,448 bytes downloaded using Azure RBAC login only. |
| Themes | Covered | 1 | Admin API read-only export. |
| FormDefinitions | Covered | 1 | Admin API read-only export. |
| FormEntries | Covered protected PII | 4 | Protected bundle only; repo reports contain counts/classification. |
| ImportRuns | Covered | 1 | Admin API read-only export. |
| PublishRuns | Covered | 1 | Admin API read-only export. |
| Users | Partial redacted | 1 | Current actor only; no full identity restore. |
| Tenant onboarding package | Metadata covered | 1 | Summary only. |
| Static publish snapshot | Metadata covered | 1 | Static artifact copy not included. |
| Resource map | Metadata covered | 1 | Read-only summary. |

## Restore Readiness

The protected bundle is local-restore dry-run ready. It is not sufficient for unattended live restore because user identity, secret-like runtime values, and live restore mutation policy remain separate gates.
