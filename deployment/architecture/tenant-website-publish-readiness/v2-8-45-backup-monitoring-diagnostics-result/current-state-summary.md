# Current State Summary

- Observability foundation: created/confirmed in `rg-pumpkin-observability-prod-centralus`.
- Diagnostic setting: `diag-to-law-pumpkin-prod-001` created/updated for approved App Services, Cosmos, media storage account/blob service, and Static Web Apps.
- Media storage protection: blob soft delete, container soft delete, versioning, and change feed enabled.
- Alerts: six low-noise metric alerts created from source-discovered metric names.
- Backup posture: Cosmos continuous 30-day confirmed; App Service snapshots visible; custom backup deferred because it requires backup storage/SAS-style configuration.
- Runtime closeout blocker: production static contact health endpoint HTTP 500.
