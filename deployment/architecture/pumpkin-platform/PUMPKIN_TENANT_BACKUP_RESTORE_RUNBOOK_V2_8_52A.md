# Pumpkin Tenant Backup Restore Runbook V2.8.52A

## Scope

This runbook describes the operator workflow proven in V2.8.52A for creating and validating a protected Ice tenant backup bundle. It does not approve live restore, tenant creation, content mutation, deploy, DNS/indexing, or secret recovery.

## Backup Workflow

1. Confirm the approved secure handoff exists and is ignored by git.
2. Lock Azure context to the expected subscription before Azure reads.
3. Authenticate to Pumpkin Admin API using the approved SuperAdmin credentials in memory only.
4. Export tenant records through read-only Admin API routes.
5. Redact tenant secret-like fields and user identity details before writing tenant/user summaries.
6. Inventory media blobs with Azure Storage RBAC `auth-mode login`.
7. Download media binaries into the protected backup bundle using short local filenames.
8. Generate `coverage-matrix.json`, `manifest.json`, and `checksums.sha256`.
9. Run local restore dry-run validation.
10. Run GET-only runtime no-regression checks.
11. Delete the approved secure handoff after successful closeout.

## Local Restore Dry-Run

The dry-run must validate:

- Required paths exist.
- JSON files parse.
- `checksums.sha256` lines match recomputed SHA-256 values.
- Media binaries exist at the protected paths in `media/manifest.json`.
- Media byte counts and SHA-256 values match the media manifest.
- Record counts are internally consistent with the bundle manifest.

V2.8.52A result: `local_restore_dry_run_passed_with_identity_and_secret_restore_gaps`.

## Live Restore Hard Stops

Stop before live restore if any of these are true:

- Target tenant is not explicitly approved.
- Identity reset/reseed plan is missing.
- Secret-like runtime/contact/API values are not provided through an ignored secure handoff.
- Media overwrite/delete policy is not approved.
- FormEntry PII handling is not approved.
- Rollback/no-regression proof is not defined.
- The protected bundle checksum validation fails.

## Known Gaps

| Gap | Required Follow-Up |
| --- | --- |
| Full user identity restore | Approve controlled user reset/reseed or a source-discovered user export route. |
| Tenant/contact/API secret restore | Use an ignored secure handoff; never write values to repo reports. |
| Static publish artifact restore | Approve protected static artifact capture or regeneration from CMS data. |
| Live restore adapter | Design and approve a mutation-scoped restore adapter before use. |

## No-Regression Checks

After backup proof, run GET-only checks for public pages, static contact health, Pumpkin API health, and Admin UI routes. Do not send contact POSTs or form submissions during backup audit phases.
