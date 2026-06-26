# Static Artifact Contact Endpoint Verification

Artifact checked:

`apps/ice-rink-web/.tmp/v2-8-23-isolated-swa-package/package_20260625190621/app/contact/index.html`

Result:

- Contact artifact exists: true.
- Contains `/api/static-contact`: true.
- Contains `/api/contact`: false.
- Contains `contact@iceskatingrinkrentals.com`: true.
- App output contains `staticwebapp.config.json`: true.

The static artifact continued to point to the same-origin SWA managed API path.

