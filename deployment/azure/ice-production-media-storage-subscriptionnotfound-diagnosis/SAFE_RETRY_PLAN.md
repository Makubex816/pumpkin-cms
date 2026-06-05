# Safe Retry Plan

Generated: 2026-06-04

## Scope

This is a future plan only.

No commands in this file were executed during the diagnosis run.

## Preconditions

Before retrying storage account creation:

1. Confirm explicit user approval for provider registration and retry.
2. Confirm active subscription is still:

```text
ff887def-fd83-4a19-9298-13d4b1687873
```

3. Confirm resource group exists:

```text
rg-ice-production-media
```

4. Confirm no unexpected storage account exists:

```text
iceskatingmedia
```

## Future Registration Step

FUTURE COMMAND ONLY.

DO NOT RUN WITHOUT EXPLICIT USER APPROVAL.

```powershell
az provider register --namespace Microsoft.Storage
```

Stop point: wait for registration state to become `Registered` before retrying storage account creation.

Future read-only polling command:

```powershell
az provider show --namespace Microsoft.Storage --query "{namespace:namespace, registrationState:registrationState}" -o table
```

## Future Storage Name Check

FUTURE READ-ONLY COMMAND ONLY AFTER REMEDIATION APPROVAL.

```powershell
az storage account check-name --name iceskatingmedia --query "{nameAvailable:nameAvailable, reason:reason, message:message}" -o table
```

Stop point: if `iceskatingmedia` is unavailable, do not choose another name without explicit approval.

## Future Storage Account Retry

FUTURE COMMAND ONLY.

DO NOT RUN WITHOUT EXPLICIT USER APPROVAL.

```powershell
az storage account create --name iceskatingmedia --resource-group rg-ice-production-media --location eastus --sku Standard_LRS --kind StorageV2 --access-tier Hot --https-only true --min-tls-version TLS1_2 --allow-blob-public-access false --public-network-access Enabled --tags site=IceSkatingRinkRentals purpose=production-media managed-by=PumpkinCMS --query "{name:name, resourceGroup:resourceGroup, location:primaryLocation, kind:kind, sku:sku.name, provisioningState:provisioningState, httpsOnly:supportsHttpsTrafficOnly, minTls:minimumTlsVersion, allowBlobPublicAccess:allowBlobPublicAccess}" -o table
```

Stop point: verify the storage account exists and settings match approval before container creation.

## Future Blob Container Retry

FUTURE COMMAND ONLY.

DO NOT RUN WITHOUT EXPLICIT USER APPROVAL.

```powershell
az storage container create --account-name iceskatingmedia --name ice-rink-rentals-media --auth-mode login --public-access off
```

Stop point: verify the container exists and remains private before any media upload.

## Still Separate Gates

Even after a successful retry, separate approval remains required for:

- media upload
- public media origin or access policy changes
- Cloudflare/DNS changes
- CMS writes
- MediaAsset writes
- static export or deployment
- media production URL readiness change
- Roller work
