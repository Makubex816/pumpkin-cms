# Azure Function Or Endpoint Planning

Generated: 2026-06-04

## Preferred Direction

Use a hardened Azure Function or equivalent public endpoint for static form intake.

Recommended endpoint path:

```text
/api/static-contact
```

## Planned Responsibilities

The endpoint should:

- receive static browser form payloads
- validate origin and payload
- apply spam and rate-limit controls
- forward sanitized submissions to Pumpkin API, a queue, or an approved lead destination
- keep server-side credentials outside the browser
- emit safe operational logs
- return generic public responses

## Future Azure Planning

After explicit approval:

- select function app naming
- select deployment environment
- configure app settings
- configure CORS and allowed origins
- configure logging and monitoring
- test with local/staging-only payloads
- verify Lead Inbox or approved destination behavior

## Not Performed

- no Azure Function app created
- no Azure resources created
- no deployment performed
- no app settings configured
- no endpoint URL set

## Readiness

Endpoint setup readiness: planned, not ready.

