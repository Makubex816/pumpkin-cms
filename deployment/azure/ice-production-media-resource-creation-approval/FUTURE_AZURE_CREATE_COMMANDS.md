# Future Azure Create Commands

Generated: 2026-06-04

## FUTURE COMMANDS ONLY

DO NOT RUN WITHOUT EXPLICIT USER APPROVAL.

The commands below are documentation only. They were not executed in this planning run.

## Proposed Values

```text
Resource group: rg-ice-production-media
Storage account: iceskatingmedia
Region: eastus
```

## Future Read-Only Context Check

Run only after explicit approval for the resource creation execution session:

```powershell
az account show --query "{name:name, subscriptionId:id, tenantId:tenantId}" -o table
```

Stop point: confirm the subscription is the intended Ice production media subscription before any create command.

## Future Resource Group Create Command

FUTURE COMMAND ONLY.

DO NOT RUN WITHOUT EXPLICIT USER APPROVAL.

```powershell
az group create `
  --name rg-ice-production-media `
  --location eastus `
  --tags site=IceSkatingRinkRentals purpose=production-media managed-by=PumpkinCMS
```

Stop point: after creation, run the read-only validation in `POST_CREATION_READONLY_VALIDATION.md` and confirm only the approved resource group exists.

## Future Storage Account Create Command

FUTURE COMMAND ONLY.

DO NOT RUN WITHOUT EXPLICIT USER APPROVAL.

```powershell
az storage account create `
  --name iceskatingmedia `
  --resource-group rg-ice-production-media `
  --location eastus `
  --sku Standard_LRS `
  --kind StorageV2 `
  --access-tier Hot `
  --https-only true `
  --min-tls-version TLS1_2 `
  --allow-blob-public-access false `
  --public-network-access Enabled `
  --tags site=IceSkatingRinkRentals purpose=production-media managed-by=PumpkinCMS
```

Stop point: confirm storage account creation, TLS settings, HTTPS-only setting, public access setting, region, SKU, and tags before any container action.

## Storage Account Name Availability Stop

If Azure reports that `iceskatingmedia` is unavailable, stop immediately.

Do not choose or create an alternate storage account name without a new explicit approval.

## Not Included

These commands do not:

- create Cosmos resources
- create Blob containers
- upload media
- create CDN or Cloudflare resources
- change DNS
- update CMS records
- update MediaAsset records
- deploy static output
- read keys
- print connection strings
- generate SAS URLs
