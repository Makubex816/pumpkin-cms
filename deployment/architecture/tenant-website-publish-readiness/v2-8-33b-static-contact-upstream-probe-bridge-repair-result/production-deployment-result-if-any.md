# Production Deployment Result

Production appsetting repair:

- Target: `swa-ice-static-staging`.
- Resource group: `rg-ice-static-staging`.
- Settings count: 8.
- Output redacted: yes.
- Appsettings list/show: not run.

Production deploy:

- Deployment attempts: 1.
- Package: same `.tmp/v2-8-33b/artifacts/swa-package` used for isolated.
- Result: success.
- SWA default deployment result host: `https://happy-mud-0b375e20f.7.azurestaticapps.net`.

SWA CLI generated a package-local `.env` file during deploy. It was removed without being read.

No DNS/custom-domain mutation was performed.
