# Backup Monitoring Diagnostics Posture

## Cosmos

- Production Cosmos backup policy: Continuous.
- Continuous tier: 30 days.
- Automatic failover: enabled.
- Region inventory: East US only.
- Diagnostic settings on production Cosmos: none found.

Assessment: database backup posture is present, but monitoring/diagnostic export is not configured.

## App Service

- App Service backup items: 0.
- Application logs: filesystem Error level.
- HTTP logs: off.
- Detailed errors: off.
- Failed request tracing: off.
- Diagnostic settings on Web App and App Service plan: none found.

Assessment: production API lacks formal backup and observability configuration.

## Static Web Apps

- Diagnostic settings on production SWA: none found.
- Diagnostic settings on isolated SWA: none found.
- Azure metadata shows no repository/branch binding.

Assessment: static runtime is live, but diagnostics/deployment provenance should be formalized.

## Media Storage

- Storage SKU: Standard_LRS.
- Blob soft delete: disabled.
- Container soft delete: not configured.
- Versioning: not enabled.
- Change feed: not configured.
- Point-in-time restore: not configured.
- Diagnostic settings: none found.

Assessment: media is live but restore posture is weak.

## Staging OLM

- App Insights: `appi-pumpkincms-stg-olm01`, 90-day retention.
- Log Analytics: `log-pumpkincms-stg-olm01`, 30-day retention.
- This is nonproduction and not attached to core production resources.

Recommended next hardening:

1. Add production diagnostics to API, SWAs, Cosmos, and media storage.
2. Decide App Service backup strategy or redeployable artifact strategy.
3. Enable storage soft delete/versioning/change feed where appropriate.
4. Add availability checks and alerting for contact, Admin API, and media.
