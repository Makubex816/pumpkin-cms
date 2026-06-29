# Isolated Deployment Result

Isolated appsetting repair:

- Target: `swa-ice-static-isolated-staging`.
- Resource group: `rg-ice-static-staging`.
- Settings count: 8.
- Output redacted: yes.
- Appsettings list/show: not run.

Isolated deploy:

- Deployment attempts: 1.
- Package: `.tmp/v2-8-33b/artifacts/swa-package`.
- Result: success.
- Host: `https://kind-island-0a85a740f.7.azurestaticapps.net`.

SWA CLI generated a package-local `.env` file during deploy. It was removed without being read.
