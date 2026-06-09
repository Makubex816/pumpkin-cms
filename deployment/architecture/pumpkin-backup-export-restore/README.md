# Pumpkin Backup Export Restore Architecture

## Purpose

This package defines the production-grade Pumpkin Backup Center architecture for backup export, restore validation, offline editing packages, and encrypted secret escrow.

Backup Center is now a hard prerequisite before future CMS write/import execution, Roller static readiness execution, production readiness execution, live-page publication, or onboarding UI implementation.

## Result

- Standard backups exclude secrets by default.
- Recovery escrow backups can include encrypted, allowlisted secrets only after a separate elevated approval.
- Escrow creation and escrow restore are separate workflows with separate approvals.
- Restore is not part of backup creation.
- Restore validation starts in sandbox/local restore targets before production recovery.
- Backup jobs run through queued workers, private temp storage, checksums, audit logs, retention, and access controls.
- Support packets stay redacted and never include escrow payloads.

## Package Contents

- `EXECUTIVE_SUMMARY.md`
- `SYSTEM_GOALS_AND_NON_GOALS.md`
- `BACKUP_MODES.md`
- `STANDARD_BACKUP_BUNDLE_SPEC.md`
- `RECOVERY_ESCROW_BACKUP_SPEC.md`
- `DATABASE_EXPORT_STRATEGY.md`
- `CMS_CONTENT_EXPORT_STRATEGY.md`
- `MEDIA_EXPORT_STRATEGY.md`
- `STATIC_OUTPUT_EVIDENCE_EXPORT_STRATEGY.md`
- `CONFIG_INVENTORY_AND_REDACTION.md`
- `ENCRYPTED_SECRET_ESCROW_MODEL.md`
- `ESCROW_RECIPIENT_AND_KEY_MANAGEMENT.md`
- `ESCROW_APPROVAL_WORKFLOW.md`
- `ESCROW_RESTORE_WORKFLOW.md`
- `RESTORE_VALIDATION_MODEL.md`
- `OFFLINE_EDITING_PACKAGE_MODEL.md`
- `BACKUP_JOB_WORKER_ARCHITECTURE.md`
- `BACKUP_CENTER_UI_DESIGN.md`
- `CLI_OPERATOR_WORKFLOW.md`
- `ACCESS_CONTROL_AND_ROLES.md`
- `AUDIT_LOGGING_MODEL.md`
- `RETENTION_EXPIRATION_AND_STORAGE_POLICY.md`
- `SECURITY_BOUNDARIES.md`
- `FAILURE_MODES_AND_RECOVERY.md`
- `IMPLEMENTATION_ROADMAP.md`
- `RISK_REGISTER.md`
- `OPEN_DECISIONS.md`
- `NEXT_IMPLEMENTATION_PLANNING_PROMPT.md`
- `schemas/`
- `templates/`
- `manifest.json`

## Boundary

This is architecture/design only. No implementation, backup export, escrow payload, restore, CMS write, external platform action, protected config read, or live-page publication occurred.
