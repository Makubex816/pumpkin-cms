# Next Resource Creation Prompt

Generated: 2026-06-04

Use this prompt only if the user wants to proceed from planning to the actual Azure resource creation step.

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

Approval:
Approve creating the documented Azure media resource foundation for IceSkatingRinkRentals.com only: resource group rg-ice-production-media in eastus, storage account iceskatingmedia in eastus, and Blob container ice-rink-rentals-media with public access off.

Do not upload media.
Do not change Cloudflare/DNS.
Do not update CMS records.
Do not update MediaAsset records.
Do not deploy.
Do not read protected config.
Do not print secrets, tokens, keys, connection strings, or SAS URLs.
Do not send email.
Do not touch Microsoft 365.
Do not touch Roller.

Use:
deployment/azure/ice-production-media-resource-creation-approval/

Run only the approved create commands documented there, with stop points and post-creation read-only validation.
If the storage account name is unavailable or subscription context is wrong, stop and document the blocker.
```

## Reminder

This prompt is not active approval by itself in this planning package. The user must explicitly provide approval in a future turn before any create command is run.
