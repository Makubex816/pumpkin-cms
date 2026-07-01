# V2.8.52A Tenant Backup Audit Report

## Phase Status

Status: `completed_protected_backup_bundle_created_restore_dry_run_passed_with_gaps`

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: `tenant_backup_system_audit_ice_full_backup_dry_run_restore_readiness`

Tenant: `ice-rink-rentals`

## V2.8.52 Carryforward

V2.8.52 confirmed the Ice tenant is live and platform-proven, with HTTP 200 public runtime, static contact health, Pumpkin API health, Admin UI production routes, and SuperAdmin read-only access. It reported one visible live tenant, `ice-rink-rentals`; secondary tenant creation remained unstarted and separately gated.

Live Ice counts carried into this phase were re-read for backup proof:

| Domain | Count |
| --- | ---: |
| Pages | 3 |
| FormEntries | 4 |
| MediaAssets | 9 |
| Themes | 1 |
| FormDefinitions | 1 |
| PublishRuns | 1 |
| ImportRuns | 1 |

## Backup Result

The V2.8.52A backup proof created a protected tenant backup bundle outside the repo:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-52a-ice-rink-rentals-backup-proof`

The bundle contains the required manifest, checksum file, coverage matrix, restore plan, tenant data exports, media manifest, tenant package summary, static publish snapshot summary, and resource map summary. Protected bundle contents were not copied into repo reports.

Bundle summary:

| Item | Result |
| --- | --- |
| Manifest classification | `protected_tenant_backup_bundle_created_restore_dry_run_ready` |
| Checksum lines | 26 |
| Manifest SHA-256 | `60386efdcf3b3ac9d15e30c5113c8ffd49f4faab877c635eb796d5cb941f8187` |
| Checksums file SHA-256 | `8f36a6b5e0ea4c8bb1e3c4c40d5e4753c7e5d480e1df4b69da916021ac9f620f` |
| Media binary copy | 9 blobs, 22,639,448 bytes |
| Media auth mode | Azure RBAC `auth-mode login` only |

## Restore Readiness

Local restore dry-run validation passed for required path presence, JSON parsing, protected checksum verification, and media binary hash/size verification.

Restore readiness is classified as `partial_restore_ready_with_identity_secret_and_live_restore_gaps` because:

- Full user identity and credential restore require a controlled reset/reseed path.
- Tenant/contact/API secret-like values remain intentionally excluded from repo reports and redacted from tenant metadata exports.
- No live restore mutation was approved or executed.
- Static publish snapshot coverage is metadata-level unless a later approved phase copies generated static artifacts into a protected restore bundle.

## Runtime No Regression

GET-only no-regression checks on June 30, 2026 returned HTTP 200 for:

- Ice apex and www `/`, `/contact`, `/service-areas`, and `/api/static-contact-health`.
- Isolated Static Web App `/api/static-contact-health`.
- Pumpkin API `/health` and `/api/health`.
- Admin UI production `/` and `/login`.

Pumpkin API health remained HTTP 200 while reporting `providerConfigured:false`; this is recorded as a future health-signal follow-up, not repaired in this backup-only phase.

## Security Boundary

No tenant creation, live content mutation, deploy, appsetting mutation, DNS/indexing, contact POST, form submission, media upload, blob delete, storage key/listKeys, SAS generation, connection string generation, Key Vault read, protected config read outside the approved secure file, or protected bundle staging occurred.

The approved secure file was used only for V2.8.52A and was not copied into the result package.

## Outputs

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-52a-tenant-backup-audit-result/`

Durable backup docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_BACKUP_PACKAGE_SPEC_V2_8_52A.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_BACKUP_RESTORE_RUNBOOK_V2_8_52A.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_BACKUP_COVERAGE_MATRIX_V2_8_52A.md`

Next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-52a-tenant-backup-audit-result/next-phase-prompt.md`

## Commit Scope

Stage only these exact paths:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_52A_TENANT_BACKUP_AUDIT_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-52a-tenant-backup-audit-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_BACKUP_PACKAGE_SPEC_V2_8_52A.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_BACKUP_RESTORE_RUNBOOK_V2_8_52A.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_BACKUP_COVERAGE_MATRIX_V2_8_52A.md`
