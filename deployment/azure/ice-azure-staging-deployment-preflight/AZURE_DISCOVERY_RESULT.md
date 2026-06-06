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

At preflight time, no staging resource group appeared in discovery.

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

The exact recommended staging target at preflight time was a future Azure Static Web App:

```text
name: swa-ice-rink-rentals-staging
resource group: rg-pumpkin-static-staging
region: eastus unless changed by explicit deployment approval
validation host: Azure-generated default hostname first
```

The later explicit resource-creation approval selected and created:

```text
name: swa-ice-static-staging
resource group: rg-ice-static-staging
region: eastus2
validation host: happy-mud-0b375e20f.7.azurestaticapps.net
```

Static artifact deployment still requires a separate explicit approval.
