# Phase 2F-2 Backup Center Implementation Plan

## Purpose

Phase 2F-2 converts the Phase 2F-1 Backup Center architecture into an exact build plan for the Backup Center foundation.

This package is planning only. It defines where future code should live, which modules should exist, how records and schemas should relate, how the standard backup exporter and escrow exporter should be staged, and what acceptance criteria must pass before the next gate.

## Recommendation

Phase 2F-3 should start with a local-only standard backup exporter prototype under:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/`

The prototype should mirror the existing offline validator/import-package-builder style: Node `.mjs`, local fixtures, `.tmp` output, no external calls, no real database export, no real secret export, and validator-first behavior.

## Result

- Phase 2F-1 architecture: complete.
- Phase 2F-2 implementation plan: complete when this package is accepted.
- Ready for Phase 2F-3 local standard backup exporter prototype approval decision.
- Not ready for real backups, escrow, restore, CMS writes, external actions, Admin UI implementation, or live pages.

## Package Contents

- `IMPLEMENTATION_SCOPE.md`
- `NON_GOALS.md`
- `PROPOSED_PACKAGE_LOCATIONS.md`
- `MODULE_BOUNDARIES.md`
- `DATA_MODEL_PLAN.md`
- `SCHEMA_CONTRACT_PLAN.md`
- `BACKUP_JOB_MODEL_PLAN.md`
- `BACKUP_ARTIFACT_MODEL_PLAN.md`
- `STANDARD_BACKUP_EXPORTER_PLAN.md`
- `ENCRYPTED_ESCROW_EXPORTER_PLAN.md`
- `BACKUP_VALIDATOR_PLAN.md`
- `RESTORE_VALIDATION_PLAN.md`
- `API_ENDPOINT_PLAN.md`
- `CLI_COMMAND_PLAN.md`
- `ADMIN_UI_IMPLEMENTATION_PLAN.md`
- `ACCESS_CONTROL_IMPLEMENTATION_PLAN.md`
- `AUDIT_LOGGING_IMPLEMENTATION_PLAN.md`
- `RETENTION_EXPIRATION_IMPLEMENTATION_PLAN.md`
- `TEST_FIXTURE_PLAN.md`
- `ACCEPTANCE_CRITERIA.md`
- `RISKS_AND_OPEN_DECISIONS.md`
- `NEXT_PHASE_2F3_STANDARD_BACKUP_EXPORTER_PROMPT.md`
- `manifest.json`

## Boundary

No implementation occurred in Phase 2F-2. No backup, export, restore, escrow payload, protected config read, secret read, CMS write, external mutation, or live-page action occurred.
