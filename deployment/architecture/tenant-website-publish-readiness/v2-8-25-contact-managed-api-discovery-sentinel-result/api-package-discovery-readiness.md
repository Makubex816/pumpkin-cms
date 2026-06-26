# API Package Discovery Readiness

API package root:

`deployment/static-azure/forms/static-form-endpoint-compat`

Deployment package API root:

`apps/ice-rink-web/.tmp/v2-8-25-isolated-swa-package/package_20260626092703/api`

Readiness wrapper result: pass.

Verified package facts:

- App files: 42.
- API files: 13.
- `host.json` exists and sets `extensions.http.routePrefix` to `api`.
- `package.json` exists and has no `main` entry.
- `package-lock.json` exists and does not include `node_modules/@azure/functions`.
- `static-contact/function.json` exists and maps OPTIONS/POST to route `static-contact`.
- `static-contact-health/function.json` exists and maps GET to route `static-contact-health`.
- `.funcignore` exists and does not exclude either function folder or package metadata.
- No `@azure/functions`, `app.http`, or `src/functions/static-contact` markers were found in the packaged compat API.
- App output includes `staticwebapp.config.json`.
- `staticwebapp.config.json` sets `platform.apiRuntime` to `node:20`.

Conclusion: the local and packaged API shape was ready for the approved isolated deployment.
