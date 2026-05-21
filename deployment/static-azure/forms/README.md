# Static Contact Form Endpoint Foundation

Option C static sites cannot use the Next.js `/api/contact` route after export. The public `/contact` page can stay static, but the browser needs a separate POST target.

The recommended first production path is:

1. static site posts contact payloads to an Azure Function
2. Azure Function validates origin, payload size, and required fields
3. Azure Function applies spam controls
4. Azure Function forwards the sanitized entry to Pumpkin API, a queue, or CRM
5. response returns safe JSON only

No production endpoint is deployed from this repo.

Phase 6T adds a local/testable implementation foundation in:

```text
deployment/static-azure/forms/static-form-endpoint/
```

That package contains a reusable handler, validation/sanitization helpers, a local server, an Azure Function wrapper example, and sample request/response files. It is not an active Azure deployment.

## Frontend Configuration

At static build time, configure the public endpoint with one of:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<function-app>.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT=https://<function-app>.azurewebsites.net/api/static-contact
```

`NEXT_PUBLIC_STATIC_FORM_ENDPOINT` is the preferred name because it is intentionally public. It must not contain secrets.

If no static endpoint is configured, the exported contact form shows an inline error and does not pretend the request was submitted.

Runtime CMS mode still posts to:

```text
/api/contact
```

## Runtime And Static Flows

Runtime CMS mode:

```text
Browser form -> apps/ice-rink-web /api/contact -> Pumpkin API -> FormEntry -> Lead Inbox
```

Static public mode:

```text
Static browser form -> external static form endpoint -> Pumpkin API -> FormEntry -> Lead Inbox
```

The static endpoint keeps Pumpkin API keys server-side. The browser only knows the public endpoint URL.

## Expected Request Payload

```json
{
  "siteKey": "ice-rink-rentals",
  "formId": "contact",
  "pageSlug": "contact",
  "domainRoutingKey": "ice-rink-rentals-default",
  "recipientGroup": "local_admin",
  "formData": {
    "name": "Jane Example",
    "email": "jane@example.com",
    "phone": "555-0100",
    "event-location": "Example venue",
    "message": "I would like a quote."
  }
}
```

The Azure Function should infer the tenant from the allowed `Origin` header or from a server-side domain map. Do not trust browser-supplied tenant IDs for authorization.

## Expected Success Response

```json
{
  "ok": true,
  "entryId": "generated-or-forwarded-entry-id"
}
```

## Expected Error Response

```json
{
  "ok": false,
  "error": "Unable to submit this request right now."
}
```

Keep error messages generic. Log operational detail server-side only.

## Azure Function And Local Test Environment Variables

Use Azure Function App settings or GitHub environment secrets. Do not commit values.

Suggested names:

- `PUMPKIN_API_URL`
- `ICE_RINK_RENTALS_API_KEY`
- `ROLLER_RINK_RENTALS_API_KEY`
- `STATIC_FORM_ALLOWED_ORIGINS`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_FORWARD_MODE`
- `STATIC_FORM_LOCAL_PORT`
- `STATIC_FORM_MAX_BODY_BYTES`
- `STATIC_FORM_RATE_LIMIT_MODE`
- `STATIC_FORM_SPAM_PROTECTION_MODE`

Allowed origins for the first production launch should include:

- `https://iceskatingrinkrentals.com`
- `https://www.iceskatingrinkrentals.com`
- `https://ice-dev.iceskatingrinkrentals.com` when staging is active
- `https://rollerrinkrentals.com`
- `https://www.rollerrinkrentals.com`
- `https://roller-dev.rollerrinkrentals.com` when staging is active

The local test server also supports localhost origins for development.

## CORS

The endpoint should:

- respond to `OPTIONS`
- allow only configured origins
- allow `POST`
- allow `Content-Type`
- return `Vary: Origin`
- return `Cache-Control: no-store`

## Spam And Rate-Limit Notes

Before production launch:

- add a honeypot field convention
- add request size limits
- add IP or token-based rate limiting
- consider Cloudflare Turnstile or reCAPTCHA
- validate expected field names and required values
- avoid storing sensitive values unnecessarily in logs

## Example Template

`static-form-endpoint/azure-function-contact.example.ts` is a documentation template. It is not wired into deployment and contains no real endpoint values or credentials.

## Local Testing

From the endpoint folder:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm run check
$env:STATIC_FORM_FORWARD_MODE='dry-run'
npm run start:local
```

Dry-run mode validates and returns a success shape without forwarding to Pumpkin API. To verify Lead Inbox persistence locally, start Pumpkin API and provide `PUMPKIN_API_URL` plus the tenant API key environment variable in the current shell. Do not read or commit `.env.local` for this endpoint.
