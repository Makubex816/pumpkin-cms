# Production Target Verification

Verified production-bound Static Web App metadata read-only.

Production-bound target:

- Name: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`
- Custom domains:
  - `iceskatingrinkrentals.com`
  - `www.iceskatingrinkrentals.com`

Checks:

- Production target env name matched expected target: true.
- Production resource group env matched expected group: true.
- Production target owns apex custom domain: true.
- Production target owns www custom domain: true.
- Deployment token was present in process env: true.
- Deployment token value printed/listed/exported/reset: false.
- Operator token-target confirmation mentioned the production target and did not mention the isolated target.

Conclusion: production-bound target verification passed.
