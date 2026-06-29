# Backup/Monitoring Multitenancy Implications

Carryforward from V2.8.35:

- Cosmos has Continuous 30-day backup.
- Production diagnostics are largely absent.
- App Service backups are not configured.
- Media storage soft delete, versioning, and change feed are not enabled.

Multi-tenant implication:

As more tenants share the Pumpkin API and Cosmos database, diagnostics, backup restore drills, and tenant-aware incident triage become platform requirements rather than Ice-only hardening.

Priority before broader CMS rollout:

- Enable App Service backup or equivalent artifact/rollback strategy.
- Enable diagnostic settings for API, Cosmos, Static Web Apps, and media storage.
- Add tenant-aware alert dimensions or log fields.
- Enable media soft delete/versioning/change feed where appropriate.
- Document tenant-scoped restore procedure for shared containers.

No backup or monitoring settings were mutated in V2.8.36.
