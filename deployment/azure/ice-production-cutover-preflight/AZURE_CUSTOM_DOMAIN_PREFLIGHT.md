# Azure Custom Domain Preflight

Generated: 2026-06-06

## Current Azure State

Read-only Azure checks confirmed:

| Item | Value |
| --- | --- |
| account | enabled/default |
| Static Web App | `swa-ice-static-staging` |
| resource group | `rg-ice-static-staging` |
| location | `East US 2` |
| SKU | `Free` |
| provider | `SwaCli` |
| default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| environment | `default`, `Ready` |
| repository URL | none |
| branch | none |
| custom hostnames | none |

## CLI Requirements Observed

Azure CLI help for `az staticwebapp hostname set` states:

- a custom `--hostname` is required
- DNS provider records must be configured using CNAME/TXT/ALIAS
- default validation method is `cname-delegation`
- `dns-txt-token` is also supported
- the CLI example uses `dns-txt-token` for a root domain

No custom hostname was set in this preflight.

## Future Binding Considerations

Future cutover approval must explicitly allow Azure custom-domain binding for:

```text
iceskatingrinkrentals.com
www.iceskatingrinkrentals.com
```

Recommended validation approach:

- use TXT validation for the apex/root domain
- use CNAME delegation or TXT validation for `www`, depending on the Azure portal/CLI requirement at execution time
- do not assume DNS target details until Azure returns the validation/binding requirements during the approved execution

If a production-named Azure Static Web App is required instead of the existing staging-named resource, stop and request separate resource/deployment approval before cutover.
