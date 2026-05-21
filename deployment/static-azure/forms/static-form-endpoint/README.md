# Static Form Endpoint Local Implementation

This folder contains a local/testable static form endpoint foundation for Option C static public sites. It is designed to become an Azure Function later, but nothing here deploys to Azure.

Runtime CMS flow remains:

```text
Browser form -> apps/ice-rink-web /api/contact -> Pumpkin API -> FormEntry -> Lead Inbox
```

Static publishing flow becomes:

```text
Static browser form -> external static form endpoint -> Pumpkin API -> FormEntry -> Lead Inbox
```

## Files

- `contact-handler.mjs` - reusable endpoint handler.
- `validate-static-form-payload.mjs` - site/origin/payload validation.
- `sanitize-static-form-payload.mjs` - string/key/formData sanitizers.
- `local-test-server.mjs` - local-only HTTP server exposing `POST /api/contact`.
- `azure-function-contact.example.ts` - Azure Function wrapper example.
- `sample-request.json` - local Ice sample request.
- `sample-response.json` - expected success shape.

## Local Test

Validation-only dry run without Pumpkin API credentials:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
$env:STATIC_FORM_FORWARD_MODE='dry-run'
npm run start:local
```

Then POST the sample payload:

```powershell
Invoke-WebRequest `
  -Uri 'http://localhost:7072/api/contact' `
  -Method POST `
  -ContentType 'application/json' `
  -Headers @{ Origin = 'http://localhost:3002' } `
  -InFile 'sample-request.json'
```

To forward to Pumpkin API locally, set process environment variables before starting the server:

```text
PUMPKIN_API_URL=http://localhost:5064
ICE_RINK_RENTALS_API_KEY=<local secret value>
ROLLER_RINK_RENTALS_API_KEY=<local secret value>
```

Do not commit those values.

## Environment Variables

- `PUMPKIN_API_URL`
- `ICE_RINK_RENTALS_API_KEY`
- `ROLLER_RINK_RENTALS_API_KEY`
- `STATIC_FORM_ALLOWED_ORIGINS`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_ALLOW_MISSING_ORIGIN`
- `STATIC_FORM_FORWARD_MODE`
- `STATIC_FORM_LOCAL_PORT`
- `STATIC_FORM_MAX_BODY_BYTES`
- `STATIC_FORM_RATE_LIMIT_MODE`
- `STATIC_FORM_SPAM_PROTECTION_MODE`
- `ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY`
- `ROLLER_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY`

Only endpoint URLs and public endpoint names belong in frontend/static build config. Pumpkin API keys remain server-side only.

## Tenant Routing

The handler supports:

- `ice-rink-rentals`
- `roller-rink-rentals`

It resolves tenant/site by explicit `siteKey`, route-safe `tenantId`, public domain, or allowed origin. Unknown sites and origins are rejected.

## Validation And Security

The handler:

- accepts `POST` JSON only
- handles `OPTIONS` CORS preflight
- enforces a payload size limit
- allowlists origins
- sanitizes field keys and string values
- rejects honeypot fields
- validates email shape
- requires name/email plus quote-request phone and event location or message
- never echoes API keys or credentials
- returns safe JSON errors

CAPTCHA/Turnstile, durable rate limiting, production logging, monitoring, and email notifications are future work.
