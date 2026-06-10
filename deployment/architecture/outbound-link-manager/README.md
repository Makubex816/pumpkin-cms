# Outbound Link Manager

Phase 2H-1 designs the Tenant-Scoped Outbound Link Registry and Control System for Pumpkin CMS.

The core principle is simple: outbound links are managed CMS entities, not unmanaged strings buried inside page content. Each tenant/site gets a registry of normalized outbound URLs, every placement is tracked as an instance, rendering checks registry and instance state, and all changes are tenant-scoped, auditable, backup-aware, and restore-aware.

This package is architecture only. It does not implement code, run migrations, write CMS data, crawl external sites, mutate Azure/CMS/API resources, deploy, index, or publish live pages.

## Package Contents

- `EXECUTIVE_SUMMARY.md`
- `SYSTEM_GOALS_AND_NON_GOALS.md`
- `DOMAIN_MODEL.md`
- `DATABASE_SCHEMA_DRAFT.md`
- `OUTBOUND_LINK_ENTITY_MODEL.md`
- `LINK_INSTANCE_TRACKING_MODEL.md`
- `LINK_DISCOVERY_SCANNER_MODEL.md`
- `RENDERING_CONTROL_MODEL.md`
- `ADMIN_UI_DESIGN.md`
- `API_ENDPOINT_PLAN.md`
- `PERMISSION_AND_TENANT_ISOLATION_MODEL.md`
- `AUDIT_LOGGING_MODEL.md`
- `BULK_ACTION_MODEL.md`
- `BACKUP_RESTORE_INTEGRATION.md`
- `ONBOARDING_IMPORT_INTEGRATION.md`
- `TENANT_WEBSITE_BUNDLE_INTEGRATION.md`
- `LOCAL_FIRST_LIVE_READONLY_BEHAVIOR.md`
- `MIGRATION_AND_BACKFILL_PLAN.md`
- `VALIDATION_AND_TEST_PLAN.md`
- `SECURITY_SEO_AND_ACCESSIBILITY_RULES.md`
- `OPERATIONAL_READINESS_CRITERIA.md`
- `IMPLEMENTATION_ROADMAP.md`
- `RISK_REGISTER.md`
- `schemas/`
- `templates/`

## Readiness

Phase 2F Backup Generator QA/signoff is complete. Phase 2H-1 is ready for Phase 2H-2 implementation planning after owner review.

No implementation is approved by this package.
