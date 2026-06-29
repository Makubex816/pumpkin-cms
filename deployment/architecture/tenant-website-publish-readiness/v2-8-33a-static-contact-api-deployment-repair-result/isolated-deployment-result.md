# Isolated Deployment Result

Target:

- Static Web App: `swa-ice-static-isolated-staging`.
- Resource group: `rg-ice-static-staging`.
- Default host: `https://kind-island-0a85a740f.7.azurestaticapps.net`.

Deployment package:

- App: `.tmp/v2-8-33a/artifacts/swa-package/app`.
- API: `.tmp/v2-8-33a/artifacts/swa-package/api`.

Readiness wrapper:

- Artifact/API shape: passed.
- API programming model: Azure Functions v3/function.json.
- API runtime: Node 20 through `staticwebapp.config.json`.
- Deployment token present in process: yes.
- Token printed: no.

Deployment:

- Tool: `npx --yes @azure/static-web-apps-cli@2.0.9`.
- Deployment attempts: 1.
- Result: success.

No custom-domain or DNS mutation was performed.
