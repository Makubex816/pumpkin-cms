# Azure Account Subscription Check

Command shape:

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

Resource group check after creation:

| Field | Value |
| --- | --- |
| Resource group | `rg-pumpkincms-stg-eastus-olm` |
| Location | `eastus` |
| Resource group ID | `/subscriptions/<redacted>/resourceGroups/rg-pumpkincms-stg-eastus-olm` |

