# Static Artifact Contact Endpoint Verification

Artifact checked:

`apps/ice-rink-web/.tmp/v2-8-25-isolated-swa-package/package_20260626092703/app/contact/index.html`

Result:

- Contact artifact exists: true.
- Contains `/api/static-contact`: true.
- Contains `/api/contact`: false.
- Contains `contact@iceskatingrinkrentals.com`: true.
- App output contains `staticwebapp.config.json`: true.
- `staticwebapp.config.json platform.apiRuntime`: `node:20`.

The static contact page remained wired to the same-origin SWA managed API path.
