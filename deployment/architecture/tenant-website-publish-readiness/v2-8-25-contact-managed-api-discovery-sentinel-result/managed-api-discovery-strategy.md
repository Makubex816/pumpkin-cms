# Managed API Discovery Strategy

Strategy: deploy a clean sentinel API package that uses only one Azure Functions Node programming model.

Chosen package root:

`deployment/static-azure/forms/static-form-endpoint-compat`

The package contains:

- `host.json` with `extensions.http.routePrefix` set to `api`.
- `static-contact-health/function.json` and `index.js`.
- `static-contact/function.json` and `index.js`.
- Shared validation and dry-run contact handler modules.
- `.funcignore` that excludes local settings, dotenv files, tests, samples, docs, and git metadata.

The package intentionally excludes:

- `@azure/functions`.
- v4 `app.http` registration.
- `src/functions/static-contact.js`.
- `azure-function-static-contact.mjs`.
- `azure-function-adapter.mjs`.

This isolates the discovery variable to v3-compatible `function.json` routing.
