# Target Classification Result

Result: pass.

Read-only Azure Static Web Apps checks confirmed the classification:

Isolated staging target:

- Name: `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- Location: `East US 2`
- SKU: `Free`
- Custom domains: none
- Deployment approved for V2.8.19G: yes

Production-bound target:

- Name: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`
- Location: `East US 2`
- SKU: `Free`
- Custom domains:
  - `iceskatingrinkrentals.com` - Ready
  - `www.iceskatingrinkrentals.com` - Ready
- Deployment approved for V2.8.19G: no

Classification decision:

`swa-ice-static-staging` remains production-bound because public custom domains are attached. V2.8.19G targeted only `swa-ice-static-isolated-staging`.
