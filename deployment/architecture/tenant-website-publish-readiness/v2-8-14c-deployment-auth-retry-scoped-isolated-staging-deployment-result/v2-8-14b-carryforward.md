# V2.8.14B Carryforward

V2.8.14B reached the deployment boundary and stopped before deployment because `SWA_CLI_DEPLOYMENT_TOKEN` was absent.

Carried forward facts:

- Isolated target: `swa-ice-static-isolated-staging`.
- Resource group: `rg-ice-static-staging`.
- Default host: `kind-island-0a85a740f.7.azurestaticapps.net`.
- Custom domains: none.
- Required deployment auth env var: `SWA_CLI_DEPLOYMENT_TOKEN`.
- Old blocked target: `swa-ice-static-staging`.
- V2.8.14B did not deploy static content.

V2.8.14C revalidated these values and stopped before deployment for the same exact auth reason.

