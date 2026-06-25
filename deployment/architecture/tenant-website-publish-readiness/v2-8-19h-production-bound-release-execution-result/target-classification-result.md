# Target Classification Result

Result: pass.

Read-only Azure Static Web Apps metadata verified the approved production-bound target and excluded the isolated staging target.

Production-bound target:

- Name: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`
- Location: `East US 2`
- SKU: `Free`
- Custom domains:
  - `iceskatingrinkrentals.com` - Ready
  - `www.iceskatingrinkrentals.com` - Ready

Isolated staging target:

- Name: `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- Location: `East US 2`
- SKU: `Free`
- Custom domains: none

Classification decision:

`swa-ice-static-staging` is production-bound because both public custom domains are attached and Ready. V2.8.19H deployment approval applied only to this target.

