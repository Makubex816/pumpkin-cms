# Azure Resource Command Plan

Generated: 2026-06-04

## Scope

Future examples only. No Azure commands were run in this preparation pass.

All resource names below are placeholders.

## Placeholder Values

```text
<AZURE_SUBSCRIPTION_ID>
<AZURE_RESOURCE_GROUP>
<AZURE_LOCATION>
<STORAGE_ACCOUNT_NAME>
<MEDIA_CONTAINER_NAME>
```

Proposed container name from preflight:

```text
ice-rink-rentals-media
```

## Read-Only Checks First

Future read-only examples:

```powershell
az account show --query "{subscription:id, tenant:tenantId}" --output table
az group show --name <AZURE_RESOURCE_GROUP> --output table
az storage account show --name <STORAGE_ACCOUNT_NAME> --resource-group <AZURE_RESOURCE_GROUP> --output table
az storage container exists --account-name <STORAGE_ACCOUNT_NAME> --name <MEDIA_CONTAINER_NAME> --auth-mode login
```

Stop point: review output before any create command.

## Future Resource Creation Examples

Run only after explicit approval for Azure media resource creation:

```powershell
az storage account create `
  --name <STORAGE_ACCOUNT_NAME> `
  --resource-group <AZURE_RESOURCE_GROUP> `
  --location <AZURE_LOCATION> `
  --sku Standard_LRS `
  --kind StorageV2 `
  --https-only true `
  --min-tls-version TLS1_2
```

Stop point: confirm the storage account exists and settings match approval.

Run only after explicit approval for Blob container creation:

```powershell
az storage container create `
  --account-name <STORAGE_ACCOUNT_NAME> `
  --name <MEDIA_CONTAINER_NAME> `
  --auth-mode login
```

Stop point: confirm access model and origin behavior before upload.

## Required Approval

Explicit approval is required before:

- selecting the Azure subscription/resource group
- creating or changing storage resources
- creating or changing containers
- setting access policy
- reading or using Azure credentials

## Current Run Result

No Azure resources were created. No Blob containers were created.
