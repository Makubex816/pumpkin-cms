# Endpoint URL Result

Generated: 2026-06-05

## Endpoint URL

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

## Contract

The endpoint:

- uses HTTPS
- exposes `/api/static-contact`
- does not expose `/api/contact` as a deployed route
- is scoped to Ice routing in app settings
- runs in no-email `dry-run` mode

## Future Static Build Variable

After a separate approval and only if the no-email endpoint is accepted as sufficient for static endpoint/backend verification, the static frontend URL alias would be:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

This run did not set that variable in repo or static build config.

## Verification Flag

This run did not set:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```
