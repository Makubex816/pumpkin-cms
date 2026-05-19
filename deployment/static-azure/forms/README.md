# Static Contact Form Endpoint Foundation

Option C static sites cannot use the Next.js `/api/contact` route after export. The public `/contact` page can stay static, but the browser needs a separate POST target.

The recommended first production path is:

1. static site posts contact payloads to an Azure Function
2. Azure Function validates origin, payload size, and required fields
3. Azure Function applies spam controls
4. Azure Function forwards the sanitized entry to Pumpkin API, a queue, or CRM
5. response returns safe JSON only

No production endpoint is deployed in Phase 5D.

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

## Expected Request Payload

```json
{
  "formId": "contact",
  "pageSlug": "contact",
  "formData": {
    "name": "Jane Example",
    "email": "jane@example.com",
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

## Azure Function Environment Variables

Use Azure Function App settings or GitHub environment secrets. Do not commit values.

Suggested names:

- `ALLOWED_ORIGINS`
- `PUMPKIN_FORM_FORWARD_URL`
- `PUMPKIN_FORM_FORWARD_TOKEN`
- `STATIC_FORM_MAX_BODY_BYTES`

Allowed origins for the first production launch should include:

- `https://iceskatingrinkrentals.com`
- `https://www.iceskatingrinkrentals.com`
- `https://rollerrinkrentals.com`
- `https://www.rollerrinkrentals.com`

Add staging origins only when staging hosts exist.

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

`azure-function-contact.example.ts` is a documentation template. It is not wired into the build and contains no real endpoint values or credentials.
