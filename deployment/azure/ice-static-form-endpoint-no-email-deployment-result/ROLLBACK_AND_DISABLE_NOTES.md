# Rollback And Disable Notes

Generated: 2026-06-05

## Disable Endpoint

Future approved disable options:

- stop the Function App `func-ice-static-contact-20260605`
- remove or restrict `STATIC_FORM_ALLOWED_ORIGINS`
- remove or change `STATIC_FORM_ALLOWED_SITE_KEYS`
- keep `STATIC_FORM_FORWARD_MODE=dry-run`

## Remove Azure Resources

Future approved teardown can remove:

- `func-ice-static-contact-20260605`
- `EastUSPlan`
- `iceforms20260605`
- `rg-ice-static-form-endpoint`

Only perform teardown after confirming no other approved endpoint deployment uses the resource group or storage account.

## Static Rollback

No static rollback is needed now because this run did not set:

- `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
- `STATIC_FORM_ENDPOINT_VERIFIED=true`

No static site was deployed.

## Current Safety State

The endpoint remains deployed in no-email `dry-run` mode. It does not have Pumpkin API or email credentials configured.
