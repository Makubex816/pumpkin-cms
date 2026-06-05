# Required Microsoft 365 Or Email Setup

Generated: 2026-06-05

## Microsoft 365 Setup For Recommended Graph Path

Future approved setup must confirm or create:

- approved sender mailbox `contact@iceskatingrinkrentals.com`
- approved recipient destination for `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- Microsoft Entra app or Function managed identity selected for sending
- Graph `Mail.Send` capability for the selected app identity
- Exchange Online mailbox scope through RBAC for Applications where available
- admin consent or Exchange app role assignment completed by an authorized admin
- sender mailbox included in the approved scope
- test command confirming the service principal is in scope for the sender mailbox

## Preferred Scoping

Use Exchange Online RBAC for Applications for new resource-scoped access.

Fallback only if tenant constraints require it:

- Microsoft Graph application `Mail.Send`
- legacy Application Access Policy scoped to a mail-enabled group containing the contact mailbox

Do not use an unscoped tenant-wide `Mail.Send` grant as the final state unless the customer explicitly accepts that risk.

## DNS And Mail Authentication

For Microsoft 365 sending, future checks should confirm:

- SPF alignment remains valid for Microsoft 365
- DKIM is enabled or explicitly scheduled
- DMARC policy and reporting expectations are understood
- no Cloudflare/DNS mail records are changed without separate DNS approval

## SMTP Alternative Setup

SMTP AUTH with OAuth would require:

- SMTP AUTH enabled only where needed
- OAuth/App RBAC setup
- app token flow for SMTP
- endpoint SMTP OAuth code

Do not use SMTP basic authentication or mailbox passwords.

## Transactional Provider Alternative Setup

A third-party provider path would require:

- provider approval
- API key secret storage
- domain authentication
- SPF/DKIM/DMARC review
- separate DNS approval if records are needed

This path is not approved in this preflight.

