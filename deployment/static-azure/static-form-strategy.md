# Static Form Strategy

Static export mode cannot rely on Next.js API routes at runtime.

The current `apps/ice-rink-web/src/app/api/contact/route.ts` remains useful for runtime CMS mode, local preview, and any future runtime deployment. It is not present in the static `out` folder used for Azure static hosting.

## Current Behavior

Runtime CMS mode:

- contact form posts to `/api/contact`
- Next route forwards the submission to Pumpkin API

Static mode:

- contact form can post to `STATIC_FORM_ACTION` or `NEXT_PUBLIC_STATIC_FORM_ACTION` if configured
- if no static form action is configured, the form shows a clear error and does not pretend success

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

## Security Notes

Before launch:

- add bot/spam protection
- validate payload size
- validate field names and expected types
- log errors without storing sensitive values unnecessarily
- keep all service credentials in Azure/GitHub secret storage
- bypass Cloudflare cache for the form endpoint
