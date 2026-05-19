# Pumpkin Static Form Endpoint Phase 5D Report

## Executive Summary

Phase 5D added the static-compatible form endpoint foundation for Option C static-first public sites. Runtime CMS mode remains unchanged: the existing Next.js `/api/contact` route still handles local/runtime submissions and forwards them to Pumpkin API for `FormEntry` storage.

Static mode now has a clearer endpoint configuration path using `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`, with compatibility aliases retained. If no static endpoint is configured, the exported form shows an inline error and does not pretend the submission succeeded.

No Azure deployment was performed. No Cloudflare settings were changed. No real credentials, tokens, API keys, connection strings, or secrets were added.

## Files Changed

- `apps/ice-rink-web/src/lib/render-mode.ts`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `deployment/static-azure/README.md`
- `deployment/static-azure/cloudflare-cache-rules.md`
- `deployment/static-azure/static-form-strategy.md`
- `deployment/static-azure/forms/README.md`
- `deployment/static-azure/forms/azure-function-contact.example.ts`
- `PUMPKIN_STATIC_FORM_ENDPOINT_PHASE5D_REPORT.md`

## Runtime Form Behavior

Runtime CMS mode still posts to:

```text
/api/contact
```

The Next route in `apps/ice-rink-web/src/app/api/contact/route.ts` was not changed. It still resolves the site from the request host, builds a `FormEntry`, and forwards the entry to Pumpkin API.

The normal runtime build passed and still reports `/api/contact` as a dynamic route.

## Static Form Behavior

Static mode now reads the public form endpoint with this preferred build-time variable:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT
```

Compatibility aliases are also supported:

```text
STATIC_FORM_ENDPOINT
NEXT_PUBLIC_STATIC_FORM_ACTION
STATIC_FORM_ACTION
```

When static mode has no configured endpoint, the form blocks submission before `fetch` and shows:

```text
Online quote requests are not configured for this static site yet. Please contact us directly.
```

This keeps static pages honest: no fake success and no accidental POST to the missing static `/api/contact` route.

## External Endpoint Strategy

The recommended first production path is an Azure Function:

1. Browser posts static contact payload to the Azure Function URL.
2. Function validates origin, method, JSON shape, payload size, and required form data.
3. Function applies spam controls and rate limits.
4. Function maps the allowed origin to the tenant server-side.
5. Function forwards or stores the entry through Pumpkin API, a queue, or CRM.
6. Function returns safe JSON success/error output.

The public frontend endpoint value must be only a URL. Tenant API keys, Pumpkin credentials, cloud credentials, and forward tokens stay in Azure Function App settings or secret storage.

## Azure Function Recommendation

Added a docs-only Azure Function template:

```text
deployment/static-azure/forms/azure-function-contact.example.ts
```

It demonstrates:

- `OPTIONS` and `POST`
- allowed-origin CORS handling
- tenant selection from trusted origin mapping
- basic payload validation
- body size protection
- honeypot rejection hook
- forwarding to a server-side Pumpkin-compatible URL
- safe JSON responses

Expected environment variable names are documented with placeholders only:

- `ALLOWED_ORIGINS`
- `PUMPKIN_FORM_FORWARD_URL`
- `PUMPKIN_FORM_FORWARD_TOKEN`
- `STATIC_FORM_MAX_BODY_BYTES`

## Cloudflare And Cache Notes

The `/contact` page can remain static and cached like other HTML routes, conservatively until purge automation exists.

The form POST target must bypass cache:

- Azure Function URL
- `/api/static-contact`
- standalone Pumpkin/public form endpoint
- CRM/webhook endpoint if proxied through Cloudflare

Do not cache POST responses. The endpoint should return `Cache-Control: no-store`.

## CORS And Security Notes

Initial production allowed origins should include:

- `https://iceskatingrinkrentals.com`
- `https://www.iceskatingrinkrentals.com`
- `https://rollerrinkrentals.com`
- `https://www.rollerrinkrentals.com`

Add staging origins later when staging hosts exist.

Before production launch, the endpoint still needs:

- real Azure Function deployment
- Function App settings configured outside the repo
- request rate limiting
- spam protection such as honeypot plus Turnstile or reCAPTCHA
- logging policy that avoids unnecessary sensitive values
- production forwarding target confirmed

## Checks Run

- `npm run type-check` in `apps/ice-rink-web`: passed
- `npm run lint` in `apps/ice-rink-web`: passed
- `npm run build` in `apps/ice-rink-web`: passed
- `npm run export:static:ice` in `apps/ice-rink-web`: passed
- `npm run export:static:roller` in `apps/ice-rink-web`: passed
- `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out`: passed
- `node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out`: passed
- `git diff --check`: passed
- targeted high-confidence secret-pattern scan: passed
- `.github/workflows` check: no workflow directory present

## Known Limitations

- No real external endpoint is configured in repo files.
- No Azure Function was deployed.
- No Cloudflare cache or DNS settings were changed.
- Static submissions require an endpoint deployment before production launch.
- The Azure Function file is an example template only and is not wired into a build.

## Next Recommended Phase

Phase 5E should choose and implement the first real deployment target for forms:

- create an Azure Function project or deployment package
- store function secrets in Azure/GitHub secret storage
- connect the function to Pumpkin API or a queue
- test Ice and Roller submissions end-to-end against staging
- then wire static build jobs to `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
