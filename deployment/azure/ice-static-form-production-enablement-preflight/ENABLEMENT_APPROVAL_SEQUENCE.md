# Enablement Approval Sequence

Generated: 2026-06-06

## Required Sequence

1. User confirms the one-time Graph test email is visible in `contact@iceskatingrinkrentals.com`.
2. User confirms the email content is safe and no duplicates were received.
3. User explicitly approves production form enablement.
4. Set only `FORM_DELIVERY_MODE=graph` on `func-ice-static-contact-20260605`.
5. Configure the static export/validator shell with the endpoint URL.
6. Set `STATIC_FORM_ENDPOINT_VERIFIED=true` only in the approved context.
7. Rerun Ice static export and strict validators.
8. If validators pass, document readiness.
9. Keep rollback to `FORM_DELIVERY_MODE=no-email` ready.

## Do Not Do In The Next Step Without Approval

- CMS writes
- MediaAsset writes
- Cloudflare changes
- static deployment
- production website deployment
- root/www DNS changes
- Roller work
- extra unapproved email sends

