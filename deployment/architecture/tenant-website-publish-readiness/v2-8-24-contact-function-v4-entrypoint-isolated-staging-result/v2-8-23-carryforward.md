# V2.8.23 Carryforward

V2.8.23 proved the app-plus-API deployment shape improved enough for SWA CLI to deploy both folders and locate `staticwebapp.config.json`.

Carryforward facts:

- `staticwebapp.config.json` with `platform.apiRuntime=node:20` was included in the app output.
- `package-lock.json` was included in the API package.
- The deployment to `swa-ice-static-isolated-staging` succeeded exactly once.
- `/contact` GET returned 200 and serialized `/api/static-contact`.
- `OPTIONS /api/static-contact` returned 204.
- The single V2.8.23 POST returned 404 with an empty body.
- The post-failure local candidate changed the API package to `package.json main=src/functions/static-contact.js` with a CommonJS v4 registration wrapper.

V2.8.24 was approved to deploy that local-only candidate to isolated staging and submit one synthetic isolated POST after preflight.
