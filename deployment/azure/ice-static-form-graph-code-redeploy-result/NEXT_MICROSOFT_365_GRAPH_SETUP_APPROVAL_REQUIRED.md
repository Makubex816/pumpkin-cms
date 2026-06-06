# Next Microsoft 365 Graph Setup Approval Required

Generated: 2026-06-05

Do not proceed without explicit approval.

Future approval must cover:

- Microsoft Entra app or managed identity selection
- Microsoft Graph or Exchange Online application permission method
- Exchange Online RBAC for Applications mailbox scope
- approved sender `contact@iceskatingrinkrentals.com`
- approved recipient mailbox or group for `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- Azure Function app setting or Key Vault reference plan
- Graph-mode activation plan
- one-message live email verification plan

Suggested next prompt:

```text
Approve Ice Microsoft 365 Graph app/RBAC setup preflight only: determine the exact Microsoft Entra app or managed identity, Graph/Exchange permission model, Exchange Online RBAC for Applications mailbox scope, approved sender/recipient, Azure Function app setting placeholders, Graph-mode activation plan, rollback plan, and one-message live verification plan. No Microsoft 365 changes, no app registration creation, no permission grants, no Exchange RBAC changes, no Azure app setting changes, no endpoint redeploy, no real email sending, no CMS/MediaAsset/Cloudflare/static deployment, and Roller remains paused.
```

