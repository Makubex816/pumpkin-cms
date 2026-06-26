# Isolated Target Exclusion

Excluded target:

- Name: `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- Custom domains: none

Checks:

- Isolated target env matched expected excluded target: true.
- Isolated target owned apex production custom domain: false.
- Isolated target owned www production custom domain: false.
- Deployment command target was production-bound `swa-ice-static-staging`: true.
- Isolated deployment occurred in V2.8.26: false.

Conclusion: isolated target remained excluded.
