# Isolated Staging Target Verification

Read-only Azure checks:

Isolated target:

- Name: `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- SKU: Free
- Custom domains: none

Production-bound target, excluded:

- Name: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`
- Custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`

No custom-domain mutation was performed.

