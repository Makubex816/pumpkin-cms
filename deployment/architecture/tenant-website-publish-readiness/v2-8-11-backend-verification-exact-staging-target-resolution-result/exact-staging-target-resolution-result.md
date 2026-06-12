# Exact Staging Target Resolution Result

Status: resource target resolved; execution ownership still blocked.

## Resolved Target

| Field | Value |
| --- | --- |
| Platform | Azure Static Web Apps |
| Resource name | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Location | `East US 2` |
| SKU | `Free` |
| Staging environment policy | `Enabled` |
| Repository URL | not connected |
| Branch | not connected |

## Placeholder Target

The older placeholder `swa-ice-rink-rentals-staging` in `rg-pumpkin-static-staging` was not found. Azure returned `ResourceGroupNotFound` for `rg-pumpkin-static-staging`.

## Still Blocking

- named deploy operator,
- rollback/abort owner,
- explicit future deploy approval,
- deployment token/secret storage confirmation outside repo,
- backend POST/form verification approval.

