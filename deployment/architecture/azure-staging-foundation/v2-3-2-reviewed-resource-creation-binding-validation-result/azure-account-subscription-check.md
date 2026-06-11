# Azure Account Subscription Check

Command run:

```text
az account show --output json
```

Redacted result:

| Field | Value |
| --- | --- |
| Azure CLI available | yes |
| Already logged in | yes |
| Subscription display name | `Azure subscription 1` |
| Subscription state | `Enabled` |
| Default account | `true` |
| Subscription ID | redacted |
| Tenant ID | redacted |
| User type | `user` |

Candidate resource group existence check:

```text
az group show --name rg-pumpkincms-stg-eastus-olm --output json
```

Result:

| Field | Value |
| --- | --- |
| Candidate resource group | `rg-pumpkincms-stg-eastus-olm` |
| Exists | no |
| Azure mutation performed | no |

## Interpretation

The active subscription display name matches the V2.3.1 inventory display name. However, because V2.3.1 intentionally recorded subscription and tenant IDs as redacted values, V2.3.2 cannot prove a stable reviewed subscription/tenant target from committed docs alone.

