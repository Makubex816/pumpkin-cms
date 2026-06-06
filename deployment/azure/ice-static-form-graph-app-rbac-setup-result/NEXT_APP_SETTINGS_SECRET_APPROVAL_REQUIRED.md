# Next Approval Required

Generated: 2026-06-05
Updated: 2026-06-06

Do not proceed without explicit approval.

Still required before the Function can send real email:

- create an approved app credential, certificate, Key Vault reference, or managed identity delivery path
- configure Azure Function app settings or Key Vault references
- activate `FORM_DELIVERY_MODE=graph`
- restart or redeploy only if approved
- send exactly one approved live test email
- verify receipt at the approved recipient
- rerun validators and transition from dry-run/no-email verified to production email verified only after delivery is confirmed

Suggested next approval prompt:

```text
Approve Ice Graph email app credential and Function settings preflight only: choose the safest credential or managed identity path for the existing Ice Static Contact Form Mailer app, identify exact Azure Function app settings/Key Vault references required for Graph sendMail from contact@iceskatingrinkrentals.com, and prepare validation/rollback steps. No credential creation, no Azure Function app setting changes, no endpoint redeploy, no real email sending, no CMS/MediaAsset/Cloudflare/static deployment, and Roller remains paused.
```
