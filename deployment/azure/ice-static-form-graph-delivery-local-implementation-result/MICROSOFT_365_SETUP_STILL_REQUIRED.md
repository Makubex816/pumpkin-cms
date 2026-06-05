# Microsoft 365 Setup Still Required

Generated: 2026-06-05

The local adapter is not enough for production email delivery.

Still required after explicit approval:

- create or select Microsoft Entra app or approved managed identity
- grant approved Microsoft Graph or Exchange Online application capability
- scope mailbox access through Exchange Online RBAC for Applications where available
- confirm `contact@iceskatingrinkrentals.com` is the approved sender identity
- confirm approved recipient for `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- configure server-side Azure Function app settings or Key Vault references
- redeploy the endpoint
- send exactly one approved live verification email
- verify receipt at the approved recipient
- rerun static export and strict validators after production email verification

No Microsoft 365 setup was performed in this run.

