# Next Prompt: Media Preflight

Use this prompt when ready to begin the recommended first gate.

```text
Work only from the local repo filesystem and terminal.

Repo:
C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms

Branch:
feature/admin-page-editor-import-export

Primary site:
IceSkatingRinkRentals.com

Paused:
RollerRinkRentals.com remains paused.

Goal:
Create a production media setup preflight for IceSkatingRinkRentals.com only.

This is preflight/planning only unless this prompt explicitly grants approval for a named execution step.

Review safe docs and inventories, including:

- deployment/azure/ice-production-readiness-master-plan/
- deployment/azure/ice-production-media-setup-planning/
- deployment/azure/ice-first-execution-gate-decision/

Confirm the planned MediaAsset inventory, target media URL contract, validation steps, approval boundaries, rollback expectations, and exact next approval needed.

Do not create Azure resources unless explicitly approved inside this future prompt.
Do not create Cosmos resources.
Do not create Blob containers unless explicitly approved inside this future prompt.
Do not upload media.
Do not update CMS records.
Do not update MediaAsset records.
Do not change Cloudflare or DNS.
Do not deploy.
Do not send email.
Do not touch Microsoft 365.
Do not read protected config.
Do not print secret values.
Do not print JWT values.
Do not stage generated static artifacts.
Do not touch Roller.

Protected config:
Do not read or modify .env.local, appsettings.Development.json, or protected config files.

Acceptance:

- media preflight package or report exists
- current media blockers are clearly restated
- exact approval required for any media execution is documented
- no resources, uploads, writes, DNS changes, deployments, protected config reads, or Roller actions occurred
```
