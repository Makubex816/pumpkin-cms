# Backup Non-Technical UI Plan

## SuperAdmin-Only Surface

Route concept: `/dashboard/backups`.

Primary controls:

- Back up this tenant.
- Include website files.
- Include uploaded media.
- Include database records.
- Validate backup.
- Run restore dry-run.
- Download manifest.
- View missing recovery items.

## Operator Status Labels

- Ready to back up.
- Needs secure handoff.
- Backup running.
- Backup created.
- Validation passed.
- Validation failed.
- Missing recovery items.
- Restore dry-run passed.
- Restore dry-run blocked.
- Live restore not approved.

## Detail Panels

- Coverage: what was included and what was excluded.
- Files: manifest, checksums, media manifest, package references, overlays.
- Recovery gaps: identity, secrets, DomainBinding, artifacts, PII.
- Restore: dry-run status, runbook, hard stops.
- Security: proof that no secrets are in repo reports.

## Plain-Language Rules

The UI should explain:

- A backup is not the same as a live restore.
- Secret values are never shown in the UI after capture.
- Missing secrets do not block backup creation, but they do block full recovery.
- DNS/indexing/deploy actions require later approvals.

