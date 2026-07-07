# Pumpkin Backup Manager Export Implementation V2.8.61A

Status: implemented as local operator exporter.

Implementation:

`deployment/architecture/pumpkin-platform/backup-manager-export/v2-8-61a/airstrip-backup-export.mjs`

The exporter is intentionally local/operator-scoped. It does not add production API endpoints, queues, workers, artifact storage, or Admin UI Backup Manager screens.

Capabilities:

- approved secure handoff read;
- SuperAdmin login for bearer auth;
- existing authenticated GET-route export;
- Tenant/Page/MediaAsset/Theme/FormDefinition/FormEntry/ImportRun/PublishRun/DomainBinding/sanitized User domain coverage;
- public media URL download;
- website ZIP, normalized package, and overlay preservation;
- manifest and checksum generation;
- restore runbook seed and missing item report.

V2.8.61A did not require a Pumpkin API deploy.
