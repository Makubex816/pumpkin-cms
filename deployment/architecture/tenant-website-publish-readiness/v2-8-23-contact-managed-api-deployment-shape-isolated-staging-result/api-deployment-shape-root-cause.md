# API Deployment Shape Root Cause

Confirmed root cause from V2.8.22 and V2.8.23:

- The static app was deployed and served correctly.
- The managed API folder was included in the deploy command, but POST `/api/static-contact` still returned 404.
- The V2.8.22 package relied on an ESM root entrypoint and did not include `staticwebapp.config.json` in the app output.
- V2.8.23 added `staticwebapp.config.json` with `platform.apiRuntime=node:20` and package-lock metadata, then deployed once.
- The V2.8.23 POST still returned 404, so the remaining likely trigger-discovery issue is the deployable API entrypoint shape.

Inference:

The Azure Static Web Apps managed Functions worker likely did not discover the root ESM `main=azure-function-static-contact.mjs` entrypoint as a live HTTP trigger. After the no-retry gate, the local package was changed to a generated-style CommonJS v4 registration file at `src/functions/static-contact.js`, with `package.json main` pointing there. That next-candidate shape was not deployed in V2.8.23.

