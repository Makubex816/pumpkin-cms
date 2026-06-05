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
- `graph-send-mail-delivery.mjs` - local Microsoft Graph `sendMail` delivery adapter, disabled unless explicitly selected.
- `azure-function-adapter.mjs` - Azure Function request adapter and route constants.
- `azure-function-static-contact.mjs` - deployable Azure Functions entrypoint for `/api/static-contact`.
- `azure-function-contact.example.ts` - TypeScript wrapper example aligned to `/api/static-contact`.
- `host.json` - Azure Functions host metadata with the default `api` route prefix.
- `local.settings.sample.json` - placeholder-only local settings sample; do not copy real secrets into repo files.
- `.funcignore` - excludes local/test/docs files from Function publish packages.
- `local-test-server.mjs` - local-only HTTP server exposing primary `POST /api/static-contact` and local compatibility `POST /api/contact`.
- `test-static-form-endpoint.mjs` - package-local handler/validation tests.
- `test-graph-send-mail-delivery.mjs` - mocked Graph token/sendMail tests; no real token request or email send.
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
npm run test:graph
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

## Delivery Modes

Default local delivery mode:

```text
dry-run
```

Delivery mode resolution:

- `FORM_DELIVERY_MODE=graph` or `FORM_DELIVERY_MODE=m365-graph` enables the local Microsoft Graph sendMail adapter.
- `FORM_DELIVERY_MODE=pumpkin-api` forwards to Pumpkin API.
- `FORM_DELIVERY_MODE=dry-run` or `FORM_DELIVERY_MODE=no-email` accepts without delivery.
- legacy `STATIC_FORM_FORWARD_MODE=pumpkin-api` still forwards to Pumpkin API when `FORM_DELIVERY_MODE` is absent.
- missing or unknown delivery mode falls back to `dry-run`.

Graph mode is local-code-ready only. It is not deployed and is not production-ready until Microsoft 365 app/RBAC setup, Azure app settings, endpoint redeploy, and one approved live email test are separately approved and completed.

## Graph Mode Placeholders

Graph delivery requires server-side settings only:

```text
FORM_DELIVERY_MODE=graph
MICROSOFT_GRAPH_TENANT_ID=<Microsoft tenant id>
MICROSOFT_GRAPH_CLIENT_ID=<Microsoft Graph app client id>
MICROSOFT_GRAPH_CLIENT_SECRET -> <Key Vault reference or approved server-side secret>
MICROSOFT_GRAPH_SENDER_USER=contact@iceskatingrinkrentals.com
ICE_RINK_RENTALS_LEAD_RECIPIENT=<approved recipient mailbox or distribution group>
MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS=false
FORM_EMAIL_REPLY_TO_MODE=<none|submitter-email|static>
FORM_EMAIL_REPLY_TO_ADDRESS=<approved static reply-to mailbox>
FORM_EMAIL_SUBJECT_PREFIX=<approved subject prefix>
```

The current adapter uses the Microsoft identity platform client credentials token endpoint and Microsoft Graph `/users/{sender}/sendMail`. Tests mock both HTTP calls. No real token is requested by `npm test`.

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
- `FORM_DELIVERY_MODE`
- `MICROSOFT_GRAPH_TENANT_ID`
- `MICROSOFT_GRAPH_CLIENT_ID`
- `MICROSOFT_GRAPH_CLIENT_SECRET`
- `MICROSOFT_GRAPH_SENDER_USER`
- `MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS`
- `FORM_EMAIL_REPLY_TO_MODE`
- `FORM_EMAIL_REPLY_TO_ADDRESS`
- `FORM_EMAIL_SUBJECT_PREFIX`
- `ICE_RINK_RENTALS_LEAD_RECIPIENT`
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

## Microsoft 365 Boundary

Future real email readiness still requires:

- Microsoft 365 app registration or approved managed identity setup
- Graph `Mail.Send` permission or Exchange Online app role setup
- Exchange Online RBAC for Applications scoped to the approved mailbox where available
- approved server-side Azure app settings or Key Vault references
- endpoint redeploy after approval
- exactly one approved live email test
- strict validators rerun after production email verification

No Microsoft 365 setup, Azure app setting change, endpoint redeploy, or real email send is performed by this package.

## Deployment Boundary

This local package does not deploy anything. Future endpoint deployment, endpoint URL configuration, `STATIC_FORM_ENDPOINT_VERIFIED=true`, email sending, Microsoft 365 changes, Azure resource creation, Azure app setting changes, Cloudflare/DNS changes, CMS writes, MediaAsset writes, static deployment, and Roller work all require separate explicit approval.
