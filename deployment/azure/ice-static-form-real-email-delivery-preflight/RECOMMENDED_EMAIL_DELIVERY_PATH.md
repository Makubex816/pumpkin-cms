# Recommended Email Delivery Path

Generated: 2026-06-05

## Recommendation

Use Microsoft Graph `sendMail` from the Azure Function endpoint, with `contact@iceskatingrinkrentals.com` as the approved sender identity and mailbox scope constrained through Exchange Online RBAC for Applications where available.

## Preferred Architecture

```text
Static Ice contact form
  -> /api/static-contact Azure Function
  -> existing validation/sanitization/routing
  -> Graph mail delivery dispatcher
  -> contact@iceskatingrinkrentals.com sender identity
  -> approved recipient mailbox or distribution group
```

## Routing

Frontend payload remains:

```text
staticEndpointRef=ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT
leadRecipientRef=ICE_RINK_RENTALS_LEAD_RECIPIENT
```

Server-side routing should map `ICE_RINK_RENTALS_LEAD_RECIPIENT` to a configured recipient placeholder:

```text
ICE_RINK_RENTALS_LEAD_RECIPIENT_EMAIL=<approved recipient mailbox or distribution group>
```

Do not place the recipient email value in static frontend output unless separately approved.

## Sender Identity

Preferred public sender:

```text
contact@iceskatingrinkrentals.com
```

The mailbox must be approved for app sending before production verification. Replies should either use the submitter email as `replyTo` or a fixed approved reply-to mailbox, depending on Microsoft 365 policy.

## Credential Model

Preferred:

```text
managed identity or dedicated Entra app
Exchange Online RBAC for Applications scoped to the contact mailbox
Key Vault references for any secrets if a secret/certificate path is needed
```

Avoid:

```text
SMTP basic authentication
mailbox passwords
frontend/static secrets
unscoped tenant-wide Mail.Send without a mailbox access control
```

## Endpoint Code Requirements

The current endpoint does not contain email delivery code. Future approved code work should:

- add a delivery dispatcher with explicit modes
- keep `dry-run` as the default/rollback path
- implement Graph token acquisition only server-side
- send sanitized plain-text or escaped HTML email
- include safe subject/body formatting
- set reply-to without spoofing the sender
- log only non-sensitive delivery metadata
- treat Graph `202 Accepted` as API acceptance, not delivery proof
- keep public responses generic

