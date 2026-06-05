# Future Blob Container Commands

Generated: 2026-06-04

## FUTURE COMMANDS ONLY

DO NOT RUN WITHOUT EXPLICIT USER APPROVAL.

The commands below are documentation only. They were not executed in this planning run.

## Proposed Values

```text
Storage account: iceskatingmedia
Resource group: rg-ice-production-media
Blob container: ice-rink-rentals-media
```

## Future Container Existence Check

Run only after explicit approval for the resource creation execution session and only after the storage account exists:

```powershell
az storage container exists `
  --account-name iceskatingmedia `
  --name ice-rink-rentals-media `
  --auth-mode login `
  -o table
```

Stop point: review the result before any container create command.

## Future Blob Container Create Command

FUTURE COMMAND ONLY.

DO NOT RUN WITHOUT EXPLICIT USER APPROVAL.

```powershell
az storage container create `
  --account-name iceskatingmedia `
  --name ice-rink-rentals-media `
  --auth-mode login `
  --public-access off
```

Stop point: confirm the container exists and remains private before any upload or access policy decision.

## Access Policy Boundary

The proposed container creation command keeps public access off.

Any later change to allow public media delivery, configure origin access, add CDN integration, or connect Cloudflare requires separate explicit approval.

## Not Included

These commands do not:

- list storage account keys
- print connection strings
- generate SAS URLs
- create or modify access policies beyond private container creation
- upload media
- set blob cache headers
- change Cloudflare/DNS
- update CMS records
- update MediaAsset records
- deploy static output
