# Sentinel API Package Result

Created package:

`deployment/static-azure/forms/static-form-endpoint-compat`

Runtime files:

- `host.json`
- `package.json`
- `package-lock.json`
- `.funcignore`
- `static-contact/function.json`
- `static-contact/index.js`
- `static-contact-health/function.json`
- `static-contact-health/index.js`
- `contact-handler.mjs`
- `validate-static-form-payload.mjs`
- `sanitize-static-form-payload.mjs`
- `graph-send-mail-delivery.mjs`

Local scripts:

- `npm run check`
- `npm test`

Package behavior:

- `GET /api/static-contact-health` returns a public-safe health body.
- `OPTIONS /api/static-contact` returns CORS preflight success.
- `POST /api/static-contact` reuses the existing static contact handler and defaults to dry-run delivery unless a future approved environment config changes delivery mode.

No v4 registration files are present in the compat package.
