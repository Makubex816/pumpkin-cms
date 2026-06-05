# Existing Form Tooling Review

## Validators

Strict static and staging validators read the public static endpoint from these variables, in order:

1. `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
2. `STATIC_FORM_ENDPOINT`
3. `NEXT_PUBLIC_STATIC_FORM_ACTION`
4. `STATIC_FORM_ACTION`

The endpoint value must:

- exist
- be HTTPS
- not be localhost
- not be `127.0.0.1`
- not contain placeholder markers such as `<...>` or `example.*`

Backend verification requires:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

This flag must not be set until endpoint/backend verification has actually passed.

## Frontend Static Form Path

`apps/ice-rink-web/src/lib/render-mode.ts` resolves the same endpoint aliases for static render mode.

`apps/ice-rink-web/src/components/PageRenderer.tsx` posts form payloads to:

- `/api/contact` in runtime mode
- the configured static endpoint URL in static mode

If no endpoint exists, the frontend throws a visible static-site configuration error and does not pretend the form succeeded.

## Local Endpoint Foundation

The repo already contains:

```text
deployment/static-azure/forms/static-form-endpoint/
```

Files reviewed:

- `contact-handler.mjs`
- `validate-static-form-payload.mjs`
- `sanitize-static-form-payload.mjs`
- `local-test-server.mjs`
- `azure-function-contact.example.ts`
- `sample-request.json`
- `sample-response.json`

`npm run check` in that package exited `0`.

## Foundation Capabilities

The existing handler:

- accepts `POST` JSON
- handles `OPTIONS`
- allowlists origins
- resolves Ice/Roller site identity
- limits body size
- sanitizes strings and field keys
- rejects filled honeypot fields
- validates email, name, consent, and quote-request basics
- forwards valid entries to Pumpkin API using server-side API keys
- supports `STATIC_FORM_FORWARD_MODE=dry-run`
- returns safe JSON responses
- uses `Cache-Control: no-store` and `Vary: Origin`

## Preflight Findings

- Existing Azure Function wrapper route is `contact`, producing `/api/contact`.
- Some planning docs recommend `/api/static-contact` for clearer separation.
- Current frontend form payload sends `staticEndpointRef` and `leadRecipientRef`.
- Current endpoint handler reads `domainRoutingKey` and `recipientGroup`, with defaults if absent.
- Future execution should align or map those field names before deployment so routing metadata is preserved exactly.
- Durable rate limiting, CAPTCHA/Turnstile, production monitoring, and email notifications are not implemented in the local foundation.

