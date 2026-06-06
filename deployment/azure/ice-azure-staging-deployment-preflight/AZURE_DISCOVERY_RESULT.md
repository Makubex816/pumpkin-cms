# Azure Discovery Result

Generated: 2026-06-06

## Scope

Read-only Azure CLI discovery only. No Azure resource creation, configuration change, deployment, token/key read, DNS change, or Function setting change occurred.

## Azure CLI

| Check | Result |
| --- | --- |
| Azure CLI available | yes |
| CLI version | `2.87.0` |
| account state | `Enabled` |
| default account | yes |

Subscription identifiers, tenant identifiers, tokens, deployment tokens, keys, and connection strings were not printed.

## Resource Groups

Read-only group list by name/location:

| Name | Location |
| --- | --- |
| `rg-ice-production-media` | `eastus` |
| `rg-ice-static-form-endpoint` | `eastus` |
| `DefaultResourceGroup-EUS` | `eastus` |

No `rg-pumpkin-static-staging` resource group currently appears in discovery.

## Static Web Apps

Read-only Static Web App list by name/resource group/location/default hostname:

```text
none found
```

No suitable existing Azure Static Web Apps staging target was discovered.

## Storage Accounts

Read-only storage account list by name/resource group/location:

| Name | Resource group | Location |
| --- | --- | --- |
| `iceforms20260605` | `rg-ice-static-form-endpoint` | `eastus` |
| `iceskatingmedia` | `rg-ice-production-media` | `eastus` |

These storage accounts are tied to form/media infrastructure. They are not a discovered static website staging target.

## Conclusion

No existing Azure staging host was found.

The exact recommended staging target remains a future Azure Static Web App:

```text
name: swa-ice-rink-rentals-staging
resource group: rg-pumpkin-static-staging
region: eastus unless changed by explicit deployment approval
validation host: Azure-generated default hostname first
```

Creating the resource group or Static Web App requires a separate explicit approval.
