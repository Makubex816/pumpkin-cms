# Next Media Execution Prompt

Use this prompt only after deciding the exact execution step to approve.

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
The Ice production media execution approval package exists:

- PUMPKIN_ICE_PRODUCTION_MEDIA_EXECUTION_APPROVAL_REPORT.md
- deployment/azure/ice-production-media-execution-approval/

Goal:
Execute only the explicitly approved media step for IceSkatingRinkRentals.com.

Before execution:

- restate the exact approved scope
- restate which actions remain blocked
- run git status --short
- confirm no generated static artifacts or raw images are staged
- do not read protected config unless this prompt explicitly approves it

Do not create Azure resources unless this prompt explicitly approves Azure resource creation.
Do not create Cosmos resources.
Do not create Blob containers unless this prompt explicitly approves Blob container creation.
Do not upload media unless this prompt explicitly approves upload of the 9 approved Ice media files.
Do not change Cloudflare or DNS unless this prompt explicitly approves the exact media-domain action.
Do not update CMS records unless this prompt explicitly approves exact CMS records and fields.
Do not update MediaAsset records unless this prompt explicitly approves the exact 9 MediaAsset records and fields.
Do not deploy static output unless this prompt explicitly approves deployment.
Do not send email.
Do not touch Microsoft 365.
Do not print secret values.
Do not print JWT values.
Do not stage generated static artifacts.
Do not stage raw images.
Do not touch Roller.

Protected config:
Do not read or modify .env.local, appsettings.Development.json, or protected config files unless explicitly approved in this prompt.

Acceptance:

- only the approved media execution step occurred
- all stop points were observed
- no unapproved resources, uploads, writes, DNS changes, deployments, protected config reads, raw image staging, generated artifact staging, or Roller actions occurred
- results are documented in a new report
```
