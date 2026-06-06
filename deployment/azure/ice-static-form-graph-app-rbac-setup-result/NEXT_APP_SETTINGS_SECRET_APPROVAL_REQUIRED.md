# Next App Settings Secret Approval Required

Generated: 2026-06-05

Do not proceed without explicit approval.

Still required before the Function can send real email:

- complete Exchange Online RBAC for Applications mailbox scope
- decide whether admin consent is needed or whether RBAC-only scoped role assignment is the approved path
- create an approved app credential or managed identity/certificate path
- configure Azure Function app settings or Key Vault references
- activate `FORM_DELIVERY_MODE=graph`
- redeploy or restart as needed after settings approval
- send exactly one approved live test email
- verify receipt at the approved recipient

Suggested next approval prompt:

```text
Approve Ice Exchange Online RBAC mailbox-scope completion only: using an approved Exchange Online admin session, create the Exchange service principal pointer for Ice Static Contact Form Mailer, scope Application Mail.Send to contact@iceskatingrinkrentals.com only, run read-only authorization verification, and document the result. No client secret creation, no Azure Function app setting changes, no endpoint redeploy, no real email sending, no CMS/MediaAsset/Cloudflare/static deployment, and Roller remains paused.
```

