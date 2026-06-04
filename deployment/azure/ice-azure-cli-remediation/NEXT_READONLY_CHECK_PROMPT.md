# Next Read-Only Check Prompt

Use this prompt after the user installs Azure CLI or opens Azure Cloud Shell and logs in.

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

Explicit approval:
Azure read-only discovery only for Ice production media.

Goal:
Rerun Azure read-only discovery for future Ice production media setup after Azure CLI is available and already logged in.

Allowed:

- check az availability and version
- run az account show with subscription name/id only
- list resource groups by name and region only
- list storage accounts by name/resource group/region only
- list Static Web Apps by name/resource group/region/default hostname only, if supported
- document likely Ice/Pumpkin media resource candidates by name only

Forbidden:

- do not create Azure resources
- do not create Cosmos resources
- do not create Blob containers
- do not upload media
- do not change Cloudflare or DNS
- do not deploy
- do not update CMS records
- do not update MediaAsset records
- do not send email
- do not touch Microsoft 365
- do not read protected config
- do not print API keys, secrets, JWTs, Azure tokens, Cloudflare tokens, deployment tokens, Cosmos keys, storage keys, connection strings, provider credentials, or SAS URLs
- do not run list-keys commands
- do not stage generated static artifacts
- do not stage raw images
- do not touch Roller

Protected config:
Do not read or modify .env.local, appsettings.Development.json, or protected config files.

Create/update a local report documenting only read-only discovery results and next approval required before any resource creation.
```
