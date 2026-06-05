# Graph Adapter Result

Generated: 2026-06-05

## Adapter

Added:

```text
deployment/static-azure/forms/static-form-endpoint/graph-send-mail-delivery.mjs
```

## Behavior

The adapter:

- reads placeholder env vars only
- builds a Microsoft identity token request using client credentials placeholders
- requests `scope=https://graph.microsoft.com/.default`
- builds a Graph `/users/{sender}/sendMail` request
- sends a sanitized plain-text form summary
- maps `ICE_RINK_RENTALS_LEAD_RECIPIENT` to a server-side recipient mailbox setting
- optionally sets `replyTo` only when configured
- treats Graph `202` as API acceptance
- returns the existing safe public success shape through the handler
- throws safe internal errors without exposing secrets in public responses

## Not Implemented

Not included in this local pass:

- managed identity token acquisition
- certificate credential token acquisition
- real Microsoft 365 app registration
- real Graph permission grants
- Exchange Online RBAC assignments
- Azure app setting changes
- endpoint redeploy
- live email test

Managed identity or certificate auth can be added later after the Microsoft 365/Azure setup path is explicitly approved.

