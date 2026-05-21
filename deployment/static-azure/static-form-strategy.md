# Static Form Strategy

Static export mode cannot rely on Next.js API routes at runtime. The public `/contact` page can be static HTML, but the browser must POST to a separate endpoint.

The current `apps/ice-rink-web/src/app/api/contact/route.ts` remains useful for runtime CMS mode, local preview, and any future runtime deployment. It is not present in the static `out` folder used for Azure static hosting.

## Current Behavior

Runtime CMS mode:

- contact form posts to `/api/contact`
- Next route forwards the submission to Pumpkin API
- FormEntry records continue to be saved through Pumpkin API

Static mode:

- contact form posts to `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` when configured at build time
- `STATIC_FORM_ENDPOINT`, `NEXT_PUBLIC_STATIC_FORM_ACTION`, and `STATIC_FORM_ACTION` are supported as compatibility aliases
- if no static endpoint is configured, the form shows a clear inline error and does not pretend success
- no Pumpkin API keys or cloud credentials are exposed to the browser

## Frontend Endpoint Configuration

Preferred build-time variable:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<function-app>.azurewebsites.net/api/static-contact
```

This value is public by design. It should be only a URL. Do not put tokens, API keys, or connection strings in the frontend endpoint value.

## Recommended Route Names

Recommended first endpoint path:

```text
/api/static-contact
```

For Azure Functions, the public URL will commonly look like:

```text
https://<function-app>.azurewebsites.net/api/static-contact
```

For a standalone Pumpkin-compatible public endpoint, use the same route shape if possible so the static frontend does not need tenant-specific code.

## Options

### Azure Function

Use an HTTP-triggered Azure Function for public form intake.

Pros:

- native Azure path
- can validate, rate-limit, and forward to Pumpkin/CRM
- can keep secrets outside the static site

Cons:

- requires separate deployment and monitoring
- needs CORS and spam controls

### Standalone Pumpkin Public Form Endpoint

Expose a hardened public form endpoint from Pumpkin API or a slim companion service.

Pros:

- keeps submissions in Pumpkin data model
- aligns with existing `FormEntry`

Cons:

- public endpoint needs abuse protection
- must avoid tenant API keys in the browser

### Third-Party Form Endpoint

Use a managed form service.

Pros:

- fastest launch path
- built-in spam controls may be available

Cons:

- data leaves Pumpkin unless synchronized
- vendor dependency

### CRM Endpoint

Post directly to a CRM-native web-to-lead or intake endpoint.

Pros:

- direct sales workflow

Cons:

- field mapping and spam controls can be brittle
- may expose implementation details if not mediated

## Recommended First Launch Approach

Use an Azure Function as the first production static-form endpoint.

Recommended responsibilities:

- accept JSON form payload
- validate required fields
- rate-limit by IP or token
- verify origin/host allowlist
- add spam/honeypot checks
- optionally add Turnstile or reCAPTCHA
- write to Pumpkin API or a queue using server-side credentials
- return a minimal success/failure response

Do not put Pumpkin tenant API keys or cloud credentials in browser code.

See `forms/README.md` and `forms/static-form-endpoint/README.md` for the local implementation package and Azure Function wrapper template.

## Phase 6T Local Endpoint Foundation

Phase 6T adds a separated local implementation package:

```text
deployment/static-azure/forms/static-form-endpoint/
```

It includes:

- reusable `contact-handler.mjs`
- payload validation and sanitization helpers
- local-only server on `/api/contact`
- sample request/response JSON
- Azure Function wrapper example

The package supports Ice and Roller tenant routing by `siteKey`, tenant/domain, or allowed origin. It forwards valid submissions to Pumpkin API `/api/forms/{tenantId}/entries` when server-side API key environment variables are configured. It can also run in `STATIC_FORM_FORWARD_MODE=dry-run` for validation-only local tests.

## CORS And Origins

Allowed production origins should include:

- `https://iceskatingrinkrentals.com`
- `https://www.iceskatingrinkrentals.com`
- `https://rollerrinkrentals.com`
- `https://www.rollerrinkrentals.com`

Add staging domains later when staging hosts exist.

The endpoint should:

- reject unrecognized origins
- respond to `OPTIONS`
- allow `POST`
- allow `Content-Type`
- return `Vary: Origin`
- return `Cache-Control: no-store`

## Cloudflare Cache

The `/contact` page itself can be static and cached conservatively like other HTML routes.

The form POST target must bypass cache:

- Azure Function path such as `/api/static-contact`
- standalone Pumpkin/public form endpoint
- CRM/webhook endpoint if proxied through Cloudflare

Do not cache POST responses.

## Security Notes

Before launch:

- add bot/spam protection
- validate payload size
- validate field names and expected types
- log errors without storing sensitive values unnecessarily
- keep all service credentials in Azure/GitHub secret storage
- bypass Cloudflare cache for the form endpoint

Future production work still needs durable rate limiting, CAPTCHA/Turnstile, monitoring, alerting, and optional email/CRM notification wiring.
