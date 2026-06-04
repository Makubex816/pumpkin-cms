# Environment Variables Required

Generated: 2026-06-04

## Static Frontend Build Variables

The static frontend and validators look for a public endpoint URL from these variables, in order:

1. `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
2. `STATIC_FORM_ENDPOINT`
3. `NEXT_PUBLIC_STATIC_FORM_ACTION`
4. `STATIC_FORM_ACTION`

Preferred:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<function-host>/api/static-contact
```

This value is public by design. It must be only a URL. Do not put secrets, API keys, tokens, or connection strings in it.

## Verification Flag

Strict production/staging readiness requires:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

This must be set only after endpoint/backend verification passes.

## Endpoint Runtime Settings

Future endpoint runtime settings should be stored in Azure Function App settings or equivalent secret storage, not in the static frontend and not in repo files.

Suggested runtime setting names from existing docs:

- `PUMPKIN_API_URL`
- `ICE_RINK_RENTALS_API_KEY`
- `STATIC_FORM_ALLOWED_ORIGINS`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_FORWARD_MODE`
- `STATIC_FORM_MAX_BODY_BYTES`
- `STATIC_FORM_RATE_LIMIT_MODE`
- `STATIC_FORM_SPAM_PROTECTION_MODE`

No values were read or printed in this planning pass.

## Current Status

Endpoint remains missing/unverified.

Contact form production readiness remains `no`.

