# Production-bound Target Classification

Result: `swa-ice-static-staging` is production-bound.

Classification rule: custom-domain attachment, not resource name, determines the production boundary.

Read-only Azure metadata:

| Field | Value |
| --- | --- |
| Static Web App | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Location | `East US 2` |
| SKU | `Free` |
| Provider | `SwaCli` |
| Repository URL | `null` |
| Branch | `null` |

Custom domains:

| Domain | Status | Created |
| --- | --- | --- |
| `iceskatingrinkrentals.com` | `Ready` | `2026-06-06T15:40:13.863524+00:00` |
| `www.iceskatingrinkrentals.com` | `Ready` | `2026-06-06T15:51:52.753302+00:00` |

Conclusion: any deploy to `swa-ice-static-staging` is a production-bound deploy even though the resource name contains `staging`.

