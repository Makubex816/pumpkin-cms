# Pumpkin Ice Storage SubscriptionNotFound Diagnosis Report

Date: 2026-06-04

Branch: feature/admin-page-editor-import-export

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Goal

Diagnose the Azure Storage `SubscriptionNotFound` blocker using read-only Azure CLI commands only.

No storage account creation retry was approved or performed in this run.

## Start State

Latest expected commit exists:

```text
4d481bd Create Ice media resource group and document storage blocker
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
- no unexpected files identified before this diagnosis package was created

## What Was Checked

Read-only Azure checks:

- Azure CLI version
- active Azure account context
- visible Azure account list
- resource group `rg-ice-production-media`
- Microsoft.Storage provider registration state
- storage account name check for `iceskatingmedia`
- `eastus` location visibility
- visible storage account list by name/resource group/location only

Safe local docs reviewed:

- `PUMPKIN_ICE_AZURE_MEDIA_RESOURCE_CREATION_RESULT_REPORT.md`
- `deployment/azure/ice-production-media-resource-creation-result/`

No protected config was read.

## Diagnosis Results

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

Resource group:

```text
rg-ice-production-media exists in eastus with provisioning state Succeeded
```

Microsoft.Storage provider:

```text
NotRegistered
```

Storage account name check:

```text
SubscriptionNotFound
```

Region check:

```text
eastus is visible as East US
```

Visible storage accounts:

```text
none
```

## Likely Cause

Likely cause:

```text
Microsoft.Storage provider is not registered for the active subscription.
```

This is the strongest read-only diagnosis signal. It explains why Storage resource provider operations can return `SubscriptionNotFound` while general account and resource group operations still work.

The cause remains technically unproven by remediation because `az provider register` was forbidden in this pass and was not run.

## Less Likely Causes

- stale or wrong Azure CLI context: less likely because the subscription is visible, enabled, default, and the resource group is readable
- wrong tenant: less likely because account and resource group context are consistent
- unsupported region: less likely because `eastus` is visible
- storage account name unavailable: unresolved because name check fails before returning availability
- explicit subscription mismatch in create command: not indicated because the previous storage create command did not pass a `--subscription` argument

## Current Resource State

- Resource group `rg-ice-production-media`: created and still present
- Storage account `iceskatingmedia`: not created
- Blob container `ice-rink-rentals-media`: not created

## Safe Retry Readiness

Storage account creation can be safely retried later only after separate explicit approval that includes:

- registering `Microsoft.Storage`, if approved
- waiting for provider registration to complete
- rerunning storage account name availability check
- retrying only `iceskatingmedia` in `rg-ice-production-media` and `eastus`
- creating only `ice-rink-rentals-media` after storage account creation succeeds

No retry was performed in this run.

## Next Approval Required

Recommended approval wording:

```text
Approve registering the Microsoft.Storage provider for the active Ice Azure subscription, waiting for registration to complete with read-only checks, then retrying creation of storage account iceskatingmedia in rg-ice-production-media eastus and Blob container ice-rink-rentals-media only. Do not upload media, change Cloudflare/DNS, update CMS or MediaAsset records, deploy, read protected config, print secrets, send email, touch Microsoft 365, or touch Roller.
```

## Readiness Classification

- Static dry run completed: yes
- Static route output ready: yes
- Azure read-only discovery readiness: yes
- Azure resource group created: yes
- Azure storage account created: no
- Blob container created: no
- Media upload readiness: blocked by storage account creation blocker
- Media production URL readiness: no
- Contact form production readiness: no
- Azure staging readiness: no
- DNS cutover readiness: no
- Production/indexing readiness: not live-ready
- Roller: paused

## What Was Not Done

This diagnosis pass did not:

- create Azure resources
- delete Azure resources
- register Azure providers
- retry storage account creation
- create Cosmos resources
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

Created diagnosis package:

```text
deployment/azure/ice-production-media-storage-subscriptionnotfound-diagnosis/
```

Package files:

- `README.md`
- `AZURE_ACCOUNT_CONTEXT.md`
- `RESOURCE_GROUP_VERIFICATION.md`
- `MICROSOFT_STORAGE_PROVIDER_STATUS.md`
- `STORAGE_ACCOUNT_NAME_CHECK.md`
- `REGION_CHECK.md`
- `FAILURE_CAUSE_ANALYSIS.md`
- `NEXT_APPROVAL_REQUIRED.md`
- `SAFE_RETRY_PLAN.md`
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

- no new Azure resources were created in this diagnosis pass
- no Azure resources were deleted
- no provider registration command was run
- no storage account creation retry was run
- no Blob container creation command was run
- no media upload commands were run
- no Cloudflare/DNS commands were run
- no CMS write commands were run
- no MediaAsset write commands were run
- no static deployment commands were run
- no production static artifacts were staged
- no email or Microsoft 365 work occurred
- Roller remained untouched
