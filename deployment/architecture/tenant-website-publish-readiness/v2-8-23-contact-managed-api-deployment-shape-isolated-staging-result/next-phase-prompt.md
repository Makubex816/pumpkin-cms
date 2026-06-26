# Next Phase Prompt

Approve V2.8.24 only: deploy and verify the local CommonJS Azure Functions v4 managed API entrypoint shape for the Ice static contact endpoint in isolated staging.

Approved scope:

- Use the V2.8.23 result package as carryforward.
- Preserve public contact email `contact@iceskatingrinkrentals.com`.
- Preserve recovered page/media source.
- Use `deployment/static-azure/forms/static-form-endpoint/src/functions/static-contact.js`.
- Confirm `package.json main=src/functions/static-contact.js`.
- Build sanitized Ice static output.
- Confirm `staticwebapp.config.json` contains `platform.apiRuntime=node:20`.
- Package static app plus API together.
- Verify isolated target `swa-ice-static-isolated-staging` in `rg-ice-static-staging`.
- Deploy exactly once to isolated staging with app plus API configuration.
- Do not deploy to `swa-ice-static-staging`.
- After deployment, GET isolated `/contact`.
- After preflight, submit exactly one synthetic non-PII isolated POST to `/api/static-contact`.
- Do not retry after a sent POST.
- Record status/body summary/trace ID.
- Keep production deploy and production POST blocked unless the isolated POST succeeds and a separate production approval is granted.

Not approved:

- Production deployment.
- Production contact POST.
- Second isolated POST after one is sent.
- DNS/custom-domain mutation.
- Azure app settings mutation.
- Protected config reads.
- Deployment token print/list/reset/export.
- Search Console or indexing.

