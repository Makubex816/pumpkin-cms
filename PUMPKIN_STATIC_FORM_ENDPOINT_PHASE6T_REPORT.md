# Pumpkin Static Form Endpoint - Phase 6T Report

## Summary

Phase 6T adds a local/testable static form endpoint foundation for Option C static public sites. It prepares the Azure Function path without deploying anything, changing Cloudflare, sending email, or exposing Pumpkin API keys in browser code.

## Files Changed

- `deployment/static-azure/forms/README.md`
- `deployment/static-azure/static-form-strategy.md`
- `deployment/static-azure/README.md`
- `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `deployment/static-azure/forms/static-form-endpoint/package.json`
- `deployment/static-azure/forms/static-form-endpoint/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint/validate-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint/sanitize-static-form-payload.mjs`
- `deployment/static-azure/forms/static-form-endpoint/local-test-server.mjs`
- `deployment/static-azure/forms/static-form-endpoint/azure-function-contact.example.ts`
- `deployment/static-azure/forms/static-form-endpoint/sample-request.json`
- `deployment/static-azure/forms/static-form-endpoint/sample-response.json`
- `deployment/static-azure/forms/static-form-endpoint/README.md`

## Static Endpoint Design

Runtime CMS mode remains unchanged:

```text
Browser form -> apps/ice-rink-web /api/contact -> Pumpkin API -> FormEntry -> Lead Inbox
```

Static mode target flow:

```text
Static browser form -> external static form endpoint -> Pumpkin API -> FormEntry -> Lead Inbox
```

The reusable handler accepts JSON, validates/sanitizes the payload, resolves the tenant/site, builds a safe `FormEntry`, and forwards it to Pumpkin API `/api/forms/{tenantId}/entries` using server-side environment variables.

## Local Test Server Behavior

`local-test-server.mjs` exposes:

```text
POST /api/contact
OPTIONS /api/contact
```

Default port:

```text
7072
```

Use `STATIC_FORM_FORWARD_MODE=dry-run` for validation-only local testing without Pumpkin API credentials. To persist to Lead Inbox, provide `PUMPKIN_API_URL` and the tenant API key environment variable in the shell.

## Tenant And Domain Routing

Supported site keys:

- `ice-rink-rentals`
- `roller-rink-rentals`

Routing can resolve by:

- `siteKey`
- safe `tenantId`
- public domain
- allowed origin

Unknown sites/origins are rejected. Localhost origins are supported for development, with explicit `siteKey` recommended to avoid ambiguity.

## Environment Variables Required

No values are committed.

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

## Security And Safety Controls

Implemented:

- CORS allowlist
- `OPTIONS` handling
- payload size limit
- JSON payload validation
- site/tenant/domain resolution
- honeypot field rejection
- email shape validation
- required name/email/quote fields
- string and form field sanitization
- no API key echoing
- safe JSON success/error responses

Documented future work:

- durable rate limiting
- CAPTCHA/Cloudflare Turnstile
- monitoring/logging
- email/CRM notification wiring
- Azure deployment

## Pumpkin API Forwarding Behavior

For each valid submission, the handler builds a `FormEntry` with:

- `tenantId`
- `formId`
- `pageSlug`
- sanitized `formData`
- submitted timestamp
- IP/user-agent when available
- metadata source `static-form-endpoint`
- routing tags for site, page, form, domain routing key, recipient group, and routing mode

It then posts to:

```text
{PUMPKIN_API_URL}/api/forms/{tenantId}/entries
```

with the tenant API key from the server-side environment.

## Runtime CMS Compatibility

No runtime app code was changed. `apps/ice-rink-web` still posts runtime CMS forms to `/api/contact`.

## Static Frontend Compatibility

Static mode remains compatible:

- configured endpoint: posts to `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` or aliases
- missing endpoint: shows the existing inline error and does not pretend success
- loading/success/error states remain handled by the public form component
- form submissions now include safe `siteKey` and `tenantId` hints derived from the page tenant so local static endpoint testing can route Ice/Roller correctly without exposing API keys

## Local Verification Results

- endpoint package syntax check - passed with `npm run check`
- sample JSON parse - passed for `sample-request.json` and `sample-response.json`
- direct handler dry-run Ice request - returned HTTP-style status 200 with `ok: true`
- direct handler invalid payload - returned status 400 with clear validation errors for missing name, invalid email, missing phone, and missing event location/message
- direct handler unknown origin/site test - returned status 400 with `Origin is not allowed.`
- local test server dry-run request - started `local-test-server.mjs` on port 7072 and posted `sample-request.json`; response status 200 with `ok: true`
- local static-style payload with `tenantId` and localhost origin routed successfully in dry-run mode; this verifies the frontend `siteKey`/`tenantId` hints support local Ice/Roller testing without relying on production origins
- API keys were not printed and were not read from `.env.local`
- Pumpkin API forwarding and Lead Inbox persistence were not executed because process-scoped tenant API key environment variables were not provided. No credentials were faked.

## Completed Local Forwarding Verification

- Pumpkin API was running.
- Admin was running.
- Frontend was running.
- Local static form endpoint server started on port 7072.
- Local tenant API keys were loaded from the developer shell without printing secret values.
- Ice static endpoint POST returned `ok: true`.
- Ice `FormEntry` appeared in the Lead Inbox.
- Roller static endpoint POST returned `ok: true`.
- Roller `FormEntry` appeared in the Lead Inbox.
- Tenant/domain routing worked for Ice and Roller.
- Invalid payload and unknown origin dry-run checks remain documented above.
- No real emails were sent.
- No Azure deployment occurred.
- No Cloudflare changes occurred.
- No `.env.local` or `appsettings.Development.json` changes occurred.

## Checks Run

- `npm run check` in `deployment/static-azure/forms/static-form-endpoint` - passed
- JSON parse check for endpoint sample request/response - passed
- direct handler dry-run/invalid/unknown-origin smoke tests - passed
- local test server dry-run POST - passed
- `npm run type-check` in `apps/ice-rink-web` - passed
- `npm run lint` in `apps/ice-rink-web` - passed
- `npm run build` in `apps/ice-rink-web` - passed
- local static-style tenant routing smoke test - passed
- `git diff --check` - passed with expected LF-to-CRLF working-copy warnings for touched docs only
- protected config check for `apps/ice-rink-web/.env.local` and `apps/pumpkin-api/appsettings.Development.json` - passed with no changes reported
- targeted secret scan over Phase 6T files - reviewed expected API key environment variable names only; no credential values or private keys found

## Known Limitations

- No Azure Function App was deployed.
- No Cloudflare rules were changed.
- No production email notification was added.
- No CAPTCHA/Turnstile credential or provider integration was added.
- Local dry-run mode validates endpoint behavior but does not create a `FormEntry`.

## Next Recommended Phase

Phase 6U: authenticated local end-to-end static form smoke test using process-scoped tenant API keys, then Azure Function staging deployment with CORS, Turnstile/rate-limit decisions, and Lead Inbox verification.
