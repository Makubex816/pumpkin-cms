# V2.8.14B Carryforward

V2.8.14B was classified `blocked_before_deployment_auth_missing`.

Carryforward facts used by V2.8.14C:

- The old target `swa-ice-static-staging` remains blocked because production custom domains are attached.
- The approved isolated target is `swa-ice-static-isolated-staging` in `rg-ice-static-staging`.
- The approved isolated default hostname is `kind-island-0a85a740f.7.azurestaticapps.net`.
- The isolated target has no custom domains.
- Pinned tooling is `npx --yes @azure/static-web-apps-cli@2.0.9`.
- The required deployment auth variable is `SWA_CLI_DEPLOYMENT_TOKEN`.
- Deployment, DNS, indexing, live publication, CMS writes, provider writes, protected config reads, and secret-listing remained closed until V2.8.14C gates passed.

V2.8.14C resolved the V2.8.14B blocker by confirming `SWA_CLI_DEPLOYMENT_TOKEN` presence by boolean-only checks and then executing exactly one scoped deployment to the isolated target.
