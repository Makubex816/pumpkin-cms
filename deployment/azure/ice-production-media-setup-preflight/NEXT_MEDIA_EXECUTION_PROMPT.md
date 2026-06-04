# Next Media Execution Prompt

Use this prompt only after reviewing the preflight package and deciding exactly which media execution step is approved.

```text
Work only from the local repo filesystem and terminal unless this prompt explicitly approves a named external execution step.

Repo:
C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms

Branch:
feature/admin-page-editor-import-export

Primary site:
IceSkatingRinkRentals.com

Paused:
RollerRinkRentals.com remains paused.

Context:
The Ice production media setup preflight package exists:

- PUMPKIN_ICE_PRODUCTION_MEDIA_SETUP_PREFLIGHT_REPORT.md
- deployment/azure/ice-production-media-setup-preflight/

Goal:
Execute only the specific production media step explicitly approved in this prompt.

Before any execution, restate the approved scope and confirm which actions remain blocked.

Do not create Azure resources unless this prompt explicitly approves Azure media resource creation.
Do not create Cosmos resources.
Do not create Blob containers unless this prompt explicitly approves Blob container creation.
Do not upload media unless this prompt explicitly approves media upload.
Do not update CMS records unless this prompt explicitly approves the exact CMS records and fields.
Do not update MediaAsset records unless this prompt explicitly approves the exact MediaAsset records and fields.
Do not change Cloudflare or DNS unless this prompt explicitly approves the exact Cloudflare/DNS action.
Do not deploy static output unless this prompt explicitly approves deployment.
Do not send email.
Do not touch Microsoft 365.
Do not read protected config unless this prompt explicitly approves the exact protected config access needed.
Do not print secret values.
Do not print JWT values.
Do not stage generated static artifacts.
Do not touch Roller.

Protected config:
Do not read or modify .env.local, appsettings.Development.json, or protected config files unless explicitly approved in this prompt.

Acceptance:

- only the approved media execution step occurs
- no unapproved resources, uploads, writes, DNS changes, deployments, protected config reads, or Roller actions occur
- all changed docs/results are recorded
- generated static artifacts are not staged
```
