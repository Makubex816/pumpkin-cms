# Next Approval Required

Generated: 2026-06-05
Updated: 2026-06-06

Do not proceed without explicit approval.

Still required before the Function can send real email:

- approve and run `Enable-OrganizationCustomization`
- create the one-mailbox Exchange management scope
- create the `Application Mail.Send` role assignment scoped to the contact mailbox
- verify `Test-ServicePrincipalAuthorization` reports in-scope for `contact@iceskatingrinkrentals.com`
- create an approved app credential or managed identity/certificate path
- configure Azure Function app settings or Key Vault references
- activate `FORM_DELIVERY_MODE=graph`
- redeploy or restart as needed after settings approval
- send exactly one approved live test email
- verify receipt at the approved recipient

Suggested next approval prompt:

```text
Approve Ice Exchange organization customization and RBAC mailbox-scope completion only: run Enable-OrganizationCustomization if still required, create the Exchange management scope for contact@iceskatingrinkrentals.com only, assign Application Mail.Send to the Ice Static Contact Form Mailer service principal for that scope only, run read-only authorization verification, and document the result. No client secret creation, no Azure Function app setting changes, no endpoint redeploy, no real email sending, no CMS/MediaAsset/Cloudflare/static deployment, and Roller remains paused.
```

