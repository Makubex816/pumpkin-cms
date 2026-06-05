# Package And Deployment Docs

Generated: 2026-06-05

## Updated Package Docs

Updated:

```text
deployment/static-azure/forms/static-form-endpoint/README.md
deployment/static-azure/forms/static-form-endpoint/DEPLOYMENT_INSTRUCTIONS.md
```

Docs now state:

- primary deployed Function path is `/api/static-contact`
- no deployed `/api/contact` compatibility route is registered
- local test server keeps `/api/contact` compatibility only for older local sample commands
- `STATIC_FORM_ENDPOINT_VERIFIED=true` must not be set until deployment and backend verification pass
- future publish commands are documentation only

## Packaging Files

Added:

```text
.funcignore
host.json
local.settings.sample.json
azure-function-adapter.mjs
azure-function-static-contact.mjs
```

Future approved deployment package should include:

- `package.json`
- `azure-function-static-contact.mjs`
- `azure-function-adapter.mjs`
- `contact-handler.mjs`
- `validate-static-form-payload.mjs`
- `sanitize-static-form-payload.mjs`
- `host.json`
- installed runtime dependency `@azure/functions`

Future approved deployment package should not include:

- `local.settings.json`
- `.env` files
- real secrets
- local test payloads
- report markdown files

## Future Command Shape

Documentation only; not run in this pass:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm install
npm run check
npm test
func azure functionapp publish <approved-function-app-name>
```

## Verification After Future Deployment

Before configuring the static frontend:

- verify `OPTIONS /api/static-contact`
- verify valid frontend payload
- verify legacy payload through the primary route
- verify invalid email rejection
- verify unknown routing and recipient rejection
- verify oversized message rejection
- verify honeypot rejection
- verify no secrets in responses/logs
- verify approved no-email backend persistence path

Only after that may a separate approval set:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```
