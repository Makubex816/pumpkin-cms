# Phase 2F-7 Ice Real Backup Preflight

This package defines the first real Backup Center validation target preflight: IceSkatingRinkRentals.com full website plus database standard backup.

This is planning only. It does not create a backup, export a database, call CMS/API endpoints, download media, create escrow payloads, read protected config, restore data, modify external systems, deploy, index, or publish live pages.

## Target

- Tenant: Ice Skating Rink Rentals
- Site key: `ice-rink-rentals`
- Primary domain: `iceskatingrinkrentals.com`
- `www` domain: `www.iceskatingrinkrentals.com`
- Media domain: `media.iceskatingrinkrentals.com`
- Approved live routes: `/`, `/contact`, `/service-areas`
- Known obsolete routes expected to remain 404: `/ice-rink-rentals`, `/events-holiday-activations`

## Package Files

- `PREFLIGHT_SCOPE.md`
- `NON_GOALS.md`
- `ICE_BACKUP_TARGET_PROFILE.md`
- `STANDARD_BACKUP_SCOPE.md`
- `DATABASE_BACKUP_PREFLIGHT_PLAN.md`
- `CMS_CONTENT_BACKUP_PREFLIGHT_PLAN.md`
- `MEDIA_BLOB_BACKUP_PREFLIGHT_PLAN.md`
- `STATIC_EVIDENCE_BACKUP_PREFLIGHT_PLAN.md`
- `CONFIG_INVENTORY_REDACTION_PLAN.md`
- `STANDARD_BACKUP_SECRET_EXCLUSION_PLAN.md`
- `OPTIONAL_ESCROW_APPROVAL_BOUNDARY.md`
- `RESTORE_VALIDATION_PREFLIGHT_PLAN.md`
- `ENV_PRESENCE_CHECK_PLAN.md`
- `OPERATOR_CHECKLIST.md`
- `GO_NO_GO_CRITERIA.md`
- `RISK_REGISTER.md`
- `NEXT_ICE_FULL_BACKUP_EXECUTION_PROMPT.md`
- `manifest.json`

## Recommendation

Conditional go for a later Ice full standard backup execution approval, pending explicit owner approval, required environment presence, storage/output target confirmation, database export mode approval, media copy/download approval, and restore validation target confirmation.

Real encrypted escrow execution remains no-go until separately approved.
