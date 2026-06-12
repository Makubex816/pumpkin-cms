# V2.8.14A Carryforward

V2.8.14A resolved target isolation and left one explicit blocker: deployment auth was absent.

Carried forward facts:

- Isolated target: `swa-ice-static-isolated-staging`.
- Resource group: `rg-ice-static-staging`.
- Default host: `kind-island-0a85a740f.7.azurestaticapps.net`.
- Custom domains: none.
- Required deployment auth env var: `SWA_CLI_DEPLOYMENT_TOKEN`.
- Old blocked target: `swa-ice-static-staging`.
- Old target production custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`.
- V2.8.14A did not deploy static content.

V2.8.14B revalidated these values and stopped before deployment because the auth env var remains absent.

