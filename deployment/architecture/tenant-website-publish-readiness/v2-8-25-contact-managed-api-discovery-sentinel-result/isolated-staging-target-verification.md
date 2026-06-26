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

Boolean-only token and target checks:

- PowerShell saw `SWA_CLI_DEPLOYMENT_TOKEN`: true.
- Node saw `process.env.SWA_CLI_DEPLOYMENT_TOKEN`: true.
- Isolated target env values present: true.
- Isolated target name and resource group matched expected values: true.
- Production-bound target was identified and excluded: true.
- Token-target confirmation mentioned isolated target: true.
- Token-target confirmation mentioned production-bound target/domain markers: false.
- Approved isolated POST count was exactly one: true.

No custom-domain mutation was performed.
