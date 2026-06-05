# Post-Create Read-Only Verification

Generated: 2026-06-04

## Resource Group Verification

Command:

```powershell
az group show --name rg-ice-production-media --query "{name:name, location:location, provisioningState:properties.provisioningState}" -o table
```

Result:

```text
Name: rg-ice-production-media
Location: eastus
Provisioning state: Succeeded
```

## Storage Account Verification

Command:

```powershell
az storage account show --name iceskatingmedia --query "{name:name, resourceGroup:resourceGroup, location:primaryLocation, kind:kind, sku:sku.name, provisioningState:provisioningState}" -o table
```

Result:

```text
Storage account 'iceskatingmedia' not found.
```

Storage account list result:

```text
No visible storage accounts were returned.
```

## Blob Container Verification

Command:

```powershell
az storage container exists --account-name iceskatingmedia --name ice-rink-rentals-media --auth-mode login --query "{exists:exists}" -o table
```

Result:

```text
Timed out after 34 seconds.
```

Container status:

```text
not created
```

## Final Azure Resource State

| Resource | Expected name | Result |
| --- | --- | --- |
| Resource group | `rg-ice-production-media` | exists in `eastus` |
| Storage account | `iceskatingmedia` | not found |
| Blob container | `ice-rink-rentals-media` | not created |

## Safety Verification

- no storage account keys listed
- no connection strings printed
- no SAS URLs generated
- no media uploaded
- no Cloudflare/DNS changes made
- no CMS writes made
- no MediaAsset writes made
- no static deployment run
- no protected config read
- no email/Microsoft 365 work performed
- Roller remained untouched
