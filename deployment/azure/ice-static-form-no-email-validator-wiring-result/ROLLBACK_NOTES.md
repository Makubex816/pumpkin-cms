# Rollback Notes

Generated: 2026-06-05

## Local Validation Env Rollback

No persistent rollback is required because endpoint env vars were set only in command-local shell context.

Do not persist these values until explicitly approved:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT
STATIC_FORM_ENDPOINT
STATIC_FORM_ENDPOINT_VERIFIED=true
```

## Static Artifact Rollback

Generated static artifacts were not deployed.

If the local generated output should be discarded later, remove or regenerate only under an explicit local cleanup or export approval.

## Endpoint Rollback

No Azure changes occurred in this pass.

The deployed no-email endpoint remains:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Future endpoint disable/teardown still requires separate approval.
