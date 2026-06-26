# V2.8.23 Contact Managed API Deployment Shape Result

Status: completed with isolated API POST blocker.

This phase corrected the static app package to emit `staticwebapp.config.json` with `platform.apiRuntime=node:20`, added deterministic API package metadata, deployed exactly once to `swa-ice-static-isolated-staging` with app plus API shape, and sent exactly one synthetic isolated POST.

The isolated static app deployed successfully and `/contact` returned 200 with `/api/static-contact`. The managed API route still returned HTTP 404 for the single POST, so no retry was sent and production remains blocked.

After the no-retry gate, a local-only next-candidate API shape was prepared: `package.json` now points to `src/functions/static-contact.js`, a CommonJS Azure Functions v4 registration wrapper matching the generated SWA examples. This next-candidate shape passed local readiness but was not deployed in V2.8.23.

