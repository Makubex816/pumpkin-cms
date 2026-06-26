# Static Form API Package Analysis

Original deployable package shape:

- `host.json` route prefix: `api`
- route constant: `static-contact`
- public path: `/api/static-contact`
- dependency: `@azure/functions`
- previous `package.json main`: `azure-function-static-contact.mjs`

V2.8.23 deployed package additions:

- `package-lock.json`
- `staticwebapp.config.json` in the static app output
- SWA CLI flags `--api-language node --api-version 20 --swa-config-location app`

Post-POST local next-candidate package additions:

- `src/functions/static-contact.js`
- `package.json main=src/functions/static-contact.js`
- readiness wrapper requires the generated-style entrypoint and package lock

The next-candidate package has 42 app files and 11 API files and passed the local readiness wrapper. It was not deployed in this phase.

