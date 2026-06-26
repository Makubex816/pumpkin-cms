# API Package Discovery Readiness

API package root:

`deployment/static-azure/forms/static-form-endpoint`

Deployment package API root:

`apps/ice-rink-web/.tmp/v2-8-24-isolated-swa-package/package_20260626011945/api`

Readiness wrapper result: pass.

Verified package facts:

- `host.json` exists and sets `extensions.http.routePrefix` to `api`.
- `package.json` exists.
- `package-lock.json` exists.
- `package.json main` is `src/functions/static-contact.js`.
- `@azure/functions` is present in runtime `dependencies`.
- `package-lock.json` includes `node_modules/@azure/functions`.
- `src/functions/static-contact.js` is present.
- `.funcignore` is present and does not exclude the v4 entrypoint or package metadata.
- App output includes `staticwebapp.config.json`.
- `staticwebapp.config.json` sets `platform.apiRuntime` to `node:20`.

Package counts:

- App files: 42
- API files: 11

Conclusion: the local and packaged API shape was ready for the approved isolated deployment.
