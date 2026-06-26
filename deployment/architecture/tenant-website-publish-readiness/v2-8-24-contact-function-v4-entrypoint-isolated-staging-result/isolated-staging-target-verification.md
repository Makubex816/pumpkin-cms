# Isolated Staging Target Verification

Read-only Azure checks passed.

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

Boolean-only token checks:

- Deployment token present: true
- Token value printed: false
- Isolated target env values present: true
- Target name and resource group matched the isolated target: true
- Token-target confirmation contained the isolated target name: true
- Token-target confirmation contained production-bound target/domain markers: false
- Expected endpoint env was the approved path form `/api/static-contact`: true

No custom-domain mutation was performed.
