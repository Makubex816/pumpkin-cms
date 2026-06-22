# Isolated Staging Target Classification

Result: `swa-ice-static-isolated-staging` is the safe isolated staging target.

Read-only Azure metadata:

| Field | Value |
| --- | --- |
| Static Web App | `swa-ice-static-isolated-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `kind-island-0a85a740f.7.azurestaticapps.net` |
| Location | `East US 2` |
| SKU | `Free` |
| Provider | `SwaCli` |
| Repository URL | `null` |
| Branch | `null` |

Custom-domain list result: empty.

Conclusion: public website recovery work must target this isolated staging SWA first, then require a separate production-bound deploy approval that names the target, attached domains, artifact path, commit SHA, rollback plan, and post-deploy QA routes.

