# Pumpkin Ice Blob Data-Plane RBAC Diagnosis Report

Date: 2026-06-04

Branch: feature/admin-page-editor-import-export

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Goal

Diagnose Azure Blob data-plane RBAC and upload readiness using read-only checks only.

No role assignment or media upload was approved or performed in this run.

## Start State

Latest expected commit exists:

```text
941a1e7 Create Ice Azure media storage and container
```

Current branch:

```text
feature/admin-page-editor-import-export
```

Start-state status classification:

- unrelated modified static-azure backlog files under `deployment/static-azure/`
- unrelated raw content-review input folders under `content-review/ice-final-contact-input/` and `content-review/ice-service-areas-input/`
- no generated static artifacts identified in the start-state status
- no protected config paths identified in the start-state status
- no unexpected files identified before this RBAC diagnosis package was created

## What Was Checked

Read-only Azure checks:

- Azure CLI version
- active Azure account context
- resource group `rg-ice-production-media`
- storage account `iceskatingmedia`
- Blob container `ice-rink-rentals-media`
- signed-in Azure principal safe identity fields
- current principal role assignments at subscription, resource group, storage account, and container scopes
- container data-plane read checks using `--auth-mode login`
- blob list data-plane read check using `--auth-mode login`

No protected config was read.

## Azure Context

Azure CLI:

```text
2.87.0
```

Active subscription:

```text
Name: Azure subscription 1
Subscription ID: ff887def-fd83-4a19-9298-13d4b1687873
Tenant ID: 38b16667-a82c-4ff8-98d8-aeebbec4536a
State: Enabled
Default: True
```

## Storage Resource Status

Resource group:

```text
rg-ice-production-media, eastus, Succeeded
```

Storage account:

```text
iceskatingmedia, eastus, Succeeded, StorageV2, Standard_LRS, Hot, HTTPS-only True, TLS1_2, Blob public access False
```

Blob container:

```text
ice-rink-rentals-media, Public access None
```

## Signed-In Principal

```text
Object ID: 66783b82-3ed1-48c6-8a99-ca190faae1e0
User principal name: Contact@iceskatingrinkrentals.com
Display name: Steven Benedetto
```

## Current Role Findings

Current principal role assignments found at checked scopes:

| Role definition name | Scope | Principal type | Blob data-plane access |
| --- | --- | --- | --- |
| `Owner` | `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873` | `User` | no direct Blob data-plane read/upload grant |

No `Storage Blob Data Reader`, `Storage Blob Data Contributor`, or `Storage Blob Data Owner` assignment was found for the current principal at the checked scopes.

## Data-Plane Access Result

Using Microsoft Entra login auth:

- container exists check: passed
- container show check: passed
- blob list check: failed

Blob list failure category:

```text
insufficient Blob data-plane permissions for the current principal
```

The current principal cannot list blobs with `--auth-mode login`.

Blob data-plane upload readiness:

```text
no
```

## Required Future Role

For read/list validation:

```text
Storage Blob Data Reader
```

For future media upload:

```text
Storage Blob Data Contributor
```

Recommended future scope is the narrowest practical scope, preferably the Blob container:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia/blobServices/default/containers/ice-rink-rentals-media
```

If container-scope assignment is not practical, use storage account scope:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia
```

## Next Approval Required

Before any role assignment is created, separate explicit approval is required.

Recommended approval wording:

```text
Approve assigning Storage Blob Data Contributor to the current signed-in principal for Ice media upload only, scoped to the ice-rink-rentals-media Blob container under storage account iceskatingmedia if practical, or scoped to the storage account if container scope is not practical. Do not upload media, change Cloudflare/DNS, update CMS or MediaAsset records, deploy, read protected config, print secrets, send email, touch Microsoft 365, or touch Roller.
```

Media upload still requires separate explicit approval after RBAC readiness is confirmed.

## Readiness Classification

- Static dry run completed: yes
- Static route output ready: yes
- Azure read-only discovery readiness: yes
- Azure resource group created: yes
- Microsoft.Storage provider registered: yes
- Azure storage account created: yes
- Blob container created: yes
- Blob data-plane upload readiness: no
- Media upload readiness: pending explicit approval and RBAC readiness
- Media production URL readiness: no
- Contact form production readiness: no
- Azure staging readiness: no
- DNS cutover readiness: no
- Production/indexing readiness: not live-ready
- Roller: paused

## What Was Not Done

This diagnosis pass did not:

- create Azure role assignments
- delete Azure role assignments
- create Azure resources
- delete Azure resources
- create Blob containers
- upload media
- change Cloudflare or DNS
- update CMS records
- update MediaAsset records
- deploy
- read protected config
- print secret values
- print Azure tokens
- print storage keys
- print connection strings
- generate SAS URLs
- send email
- touch Microsoft 365 settings
- stage generated static artifacts
- stage raw images
- touch Roller

## Updated Package

Created RBAC diagnosis package:

```text
deployment/azure/ice-production-media-blob-rbac-diagnosis/
```

Package files:

- `README.md`
- `AZURE_CONTEXT.md`
- `STORAGE_RESOURCE_RECHECK.md`
- `SIGNED_IN_PRINCIPAL.md`
- `CURRENT_ROLE_ASSIGNMENTS.md`
- `DATA_PLANE_READ_TEST.md`
- `REQUIRED_ROLE_RECOMMENDATION.md`
- `NEXT_RBAC_ASSIGNMENT_APPROVAL_REQUIRED.md`
- `NEXT_MEDIA_UPLOAD_APPROVAL_REQUIRED.md`
- `manifest.json`

## Final Validation

Validation commands run after package creation:

- manifest JSON parse
- `git diff --check`
- trailing whitespace scan on changed docs
- protected/generated/raw artifact path check
- targeted secret scan

Validation result:

```text
passed
```

Additional validation confirmations:

- no Azure role assignments were created
- no media upload commands were run
- no Cloudflare/DNS commands were run
- no CMS write commands were run
- no MediaAsset write commands were run
- no static deployment commands were run
- no production static artifacts were staged
- no email or Microsoft 365 work occurred
- Roller remained untouched
