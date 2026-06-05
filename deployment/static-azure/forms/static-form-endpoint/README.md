# Static Form Endpoint Local Implementation

This folder contains a local/testable static form endpoint foundation for Option C static public sites. It is designed to become an Azure Function later, but nothing here deploys to Azure.

Runtime CMS flow remains:

```text
Browser form -> apps/ice-rink-web /api/contact -> Pumpkin API -> FormEntry -> Lead Inbox
```

Static publishing flow becomes:

```text
Static browser formBlock -> external static form endpoint -> Pumpkin API -> FormEntry -> Lead Inbox
```

## Files

- `contact-handler.mjs` - reusable endpoint handler.
- `validate-static-form-payload.mjs` - site/origin/payload validation.
- `sanitize-static-form-payload.mjs` - string/key/formData sanitizers.
- `azure-function-adapter.mjs` - Azure Function request adapter and route constants.
- `azure-function-static-contact.mjs` - deployable Azure Functions entrypoint for `/api/static-contact`.
- `azure-function-contact.example.ts` - TypeScript wrapper example aligned to `/api/static-contact`.
- `host.json` - Azure Functions host metadata with the default `api` route prefix.
- `local.settings.sample.json` - placeholder-only local settings sample; do not copy real secrets into repo files.
- `.funcignore` - excludes local/test/docs files from Function publish packages.
- `local-test-server.mjs` - local-only HTTP server exposing primary `POST /api/static-contact` and local compatibility `POST /api/contact`.
- `test-static-form-endpoint.mjs` - package-local handler/validation tests.
- `test-azure-function-wrapper.mjs` - local no-email wrapper and route tests.
- `sample-request.json` - local Ice frontend-shape sample request.
- `sample-request-legacy.json` - local Ice legacy endpoint-shape sample request.
- `sample-response.json` - expected success shape.
- `DEPLOYMENT_INSTRUCTIONS.md` - future deployment instructions; not an execution log.

## Local Test

Package checks and local tests:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm run check
npm test
npm run test:wrapper
```

Validation-only dry run without Pumpkin API credentials:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
$env:STATIC_FORM_FORWARD_MODE='dry-run'
npm run start:local
```

Then POST the sample payload:

```powershell
Invoke-WebRequest `
  -Uri 'http://localhost:7072/api/static-contact' `
  -Method POST `
  -ContentType 'application/json' `
  -Headers @{ Origin = 'http://localhost:3002' } `
  -InFile 'sample-request.json'
```

The local test server also accepts `/api/contact` for local-only compatibility with older sample commands. The deployable Azure Function scaffold registers only `static-contact`, which resolves to `/api/static-contact` with the included `host.json`.

To forward to Pumpkin API locally, set process environment variables before starting the server:

```text
PUMPKIN_API_URL=http://localhost:5064
ICE_RINK_RENTALS_API_KEY=<local secret value>
ROLLER_RINK_RENTALS_API_KEY=<local secret value>
```

Do not commit those values.

## Azure Function Scaffold

The deployable scaffold uses the Azure Functions Node programming model entrypoint:

```text
azure-function-static-contact.mjs
```

Route metadata:

```text
Function name: static-contact
Route: static-contact
Host route prefix: api
Public path: /api/static-contact
```

No deployed `/api/contact` compatibility route is registered in this package. If a future deployment needs `/api/contact` compatibility, that route should be separately approved and tested so it does not confuse validators or static frontend configuration.

Before future deployment, install package dependencies in the approved build environment:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm install
```

This package includes `@azure/functions` as the Azure Functions runtime dependency. No deployment is performed by `npm install`, `npm run check`, or `npm test`.

## Payload Compatibility

The handler accepts both the current static frontend payload shape and the legacy endpoint payload shape.

Current frontend aliases:

```json
{
  "staticEndpointRef": "ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT",
  "leadRecipientRef": "ICE_RINK_RENTALS_LEAD_RECIPIENT"
}
```

Legacy endpoint fields:

```json
{
  "domainRoutingKey": "ice-rink-rentals-default",
  "recipientGroup": "local_admin"
}
```

Mapping rules:

- `domainRoutingKey` wins when present.
- `staticEndpointRef` maps to `domainRoutingKey` when the legacy field is absent.
- `recipientGroup` wins when present.
- `leadRecipientRef` maps to `recipientGroup` when the legacy field is absent.
- missing values fall back to site defaults.
- unknown routing or recipient refs are rejected with generic validation errors.

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
- `STATIC_FORM_MAX_MESSAGE_LENGTH`
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

Ice routing refs currently allowed:

- `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- configured `ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY`, defaulting to `ice-rink-rentals-default`

Ice recipient refs currently allowed:

- `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- `local_admin`

## Validation And Security

The handler:

- accepts `POST` JSON only
- handles `OPTIONS` CORS preflight
- enforces a payload size limit
- allowlists origins
- sanitizes field keys and string values
- rejects honeypot fields
- validates email shape
- requires consent
- validates allowed routing/recipient refs
- enforces message length, defaulting to 4000 characters
- supports `default-contact` and `default-quote-request`
- requires Ice quote requests to include name/email/phone, event city/state, date or date range, event type, venue setting, and message
- never echoes API keys or credentials
- returns safe JSON errors

CAPTCHA/Turnstile, durable rate limiting, production logging, monitoring, and email notifications are future work.

## Deployment Boundary

This local package does not deploy anything. Future endpoint deployment, endpoint URL configuration, `STATIC_FORM_ENDPOINT_VERIFIED=true`, email sending, Microsoft 365 changes, Azure resource creation, Cloudflare/DNS changes, CMS writes, MediaAsset writes, static deployment, and Roller work all require separate explicit approval.
