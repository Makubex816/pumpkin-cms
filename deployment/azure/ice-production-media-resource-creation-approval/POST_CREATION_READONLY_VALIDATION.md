# Post-Creation Read-Only Validation

Generated: 2026-06-04

## Purpose

These are future read-only checks for after explicit resource creation approval and execution.

They are documentation only in this planning run.

## FUTURE COMMANDS ONLY

DO NOT RUN AS CREATION VALIDATION UNTIL AFTER EXPLICIT RESOURCE CREATION APPROVAL AND EXECUTION.

## Resource Group Validation

```powershell
az group show `
  --name rg-ice-production-media `
  --query "{name:name, location:location}" `
  -o table
```

Expected result:

```text
rg-ice-production-media exists in eastus
```

## Storage Account Validation

```powershell
az storage account show `
  --name iceskatingmedia `
  --resource-group rg-ice-production-media `
  --query "{name:name, resourceGroup:resourceGroup, location:primaryLocation, kind:kind, sku:sku.name, httpsOnly:supportsHttpsTrafficOnly, minTls:minimumTlsVersion, allowBlobPublicAccess:allowBlobPublicAccess}" `
  -o table
```

Expected result:

```text
iceskatingmedia exists in rg-ice-production-media, eastus, StorageV2, Standard_LRS, HTTPS only, TLS1_2 minimum, Blob public access disabled
```

## Blob Container Validation

```powershell
az storage container exists `
  --account-name iceskatingmedia `
  --name ice-rink-rentals-media `
  --auth-mode login `
  -o table
```

Expected result:

```text
ice-rink-rentals-media exists
```

## Safety Validation

Future validation must confirm:

- no keys were listed
- no connection strings were printed
- no SAS URLs were generated
- no media was uploaded
- no DNS changes occurred
- no CMS writes occurred
- no MediaAsset writes occurred
- no deployments occurred
- no protected config was read
- Roller remained untouched

## Next Gate After Creation

Resource creation does not make media production URL readiness `yes`.

After creation, the next approval gate should decide:

- whether the created private container remains the right access model
- whether media upload is approved
- whether Cloudflare media hostname planning should proceed
- whether MediaAsset update planning needs revision based on the actual origin endpoint
