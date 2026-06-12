# Staging Target Confirmation Result

Read-only Azure metadata confirmed:

| Field | Value |
| --- | --- |
| Name | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Location | `East US 2` |
| SKU | `Free` |
| Repository URL | `null` |
| Branch | `null` |

The placeholder target `swa-ice-rink-rentals-staging` / `rg-pumpkin-static-staging` was not used.

Blocking finding:

```text
customDomains = ["iceskatingrinkrentals.com", "www.iceskatingrinkrentals.com"]
```

Because V2.8.14 does not approve live publication or production-domain cutover, deployment stopped before upload.

