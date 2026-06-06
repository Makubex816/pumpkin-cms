# Pre-Create Discovery

Generated: 2026-06-06

## Read-Only Discovery

Read-only Azure CLI discovery before creation found:

| Check | Result |
| --- | --- |
| Azure CLI available | yes |
| account enabled | yes |
| existing Static Web Apps | none |
| suitable Ice staging Static Web App found | no |
| approved staging resource group already existed | no |

Existing resource groups:

```text
rg-ice-production-media        eastus
rg-ice-static-form-endpoint    eastus
DefaultResourceGroup-EUS       eastus
```

Static Web Apps:

```text
none
```

Because no suitable Ice staging Static Web App existed, the approved execution scope allowed creation of only:

```text
resource group: rg-ice-static-staging
Static Web App: swa-ice-static-staging
location: eastus2
SKU: Free
```

No deployment token, key, secret, connection string, credential, protected config value, subscription ID, or tenant ID was printed.
