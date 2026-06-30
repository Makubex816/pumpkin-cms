# V2.8.45 Backup Monitoring Diagnostics Report

Status: `blocked_after_approved_hardening`.
Lane: `V2.8 Tenant Website / Pumpkin Live Platform Readiness`.
Classification: `runtime_no_regression_static_contact_health_failed_after_monitoring_storage_hardening`.

V2.8.45 completed the approved hardening work but is blocked at runtime closeout by static contact health HTTP 500 on both production hosts. No further mutations were performed after that GET-only finding.

Completed hardening:

- Created/confirmed `rg-pumpkin-observability-prod-centralus`.
- Created/confirmed `law-pumpkin-prod-centralus-001` with 30-day retention.
- Created/confirmed `ag-pumpkin-prod-ops-email-001` with email receiver `OpsEmail`.
- Created/updated `diag-to-law-pumpkin-prod-001` on App Services, Cosmos, media storage account/blob service, and both Static Web Apps.
- Enabled media storage blob soft delete, container soft delete, blob versioning, and change feed.
- Confirmed Cosmos Continuous30Days backup and restorable database/container metadata.
- Confirmed App Service platform snapshots and empty custom backup lists.
- Created six low-noise metric alerts from source-discovered metric names.

Runtime result:

- Public `/`, `/contact`, `/service-areas`: HTTP 200 on apex and www.
- Public `/api/static-contact-health`: HTTP 500 on apex and www across bounded rechecks.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Admin UI production `/` and `/login`: HTTP 200.
- Admin UI isolated `/` and `/login`: HTTP 200 after cold-start retry.

No app deploy, SWA deploy, contact POST, content write, DNS/indexing mutation, protected config read, owner hard-copy read, Key Vault secret read, storage keys/listKeys, SAS generation, or connection string generation occurred.

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-45-backup-monitoring-diagnostics-result/`.
