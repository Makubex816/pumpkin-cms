# Pumpkin Ice Static Form Real Email Delivery Preflight Report

Generated: 2026-06-05

## Scope

Approved action: Ice contact form real email delivery preflight only.

No email was sent. No Microsoft 365 settings were changed. No Azure Function app settings were changed. The endpoint was not redeployed. No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. No production environment variables were changed. No protected config was read. Roller remains paused.

## Current No-Email Endpoint

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Current deployed state from prior result docs:

```text
Function App: func-ice-static-contact-20260605
Resource group: rg-ice-static-form-endpoint
Runtime: Azure Functions v4, Node 24, Windows Consumption
Route: /api/static-contact
Mode: STATIC_FORM_FORWARD_MODE=dry-run
```

Safe spot-check in this preflight:

| Check | Result |
| --- | --- |
| `OPTIONS` approved Ice origin | `204` |
| valid frontend payload | `200` dry-run accepted |

The prior no-email endpoint verification remains the baseline for invalid email, unknown routing, unknown recipient, oversized message, honeypot, and unapproved origin rejection.

## Local Package Baseline

Run from `deployment/static-azure/forms/static-form-endpoint`:

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

The current handler validates and sanitizes payloads, supports the frontend fields `staticEndpointRef` and `leadRecipientRef`, and accepts no-email dry-run submissions. It does not currently implement Microsoft Graph, SMTP, or transactional email delivery.

## Recommended Real Email Path

Recommended path: Microsoft Graph `sendMail` using `contact@iceskatingrinkrentals.com` as the approved public contact identity, with app-only authorization scoped to that mailbox through Exchange Online RBAC for Applications where available.

Preferred credential shape:

```text
Azure Function managed identity or dedicated Microsoft Entra app
Microsoft Graph Mail.Send capability scoped to the contact mailbox
Secrets stored as Azure Key Vault references or approved server-side app settings only
No secrets in frontend/static output
Dry-run mode retained for rollback
```

Why this is preferred:

- avoids exposing credentials to the browser
- avoids mailbox password or basic SMTP dependency
- keeps the static frontend unchanged except for endpoint URL verification
- lets the endpoint keep validation, sanitization, CORS, and routing controls
- allows a no-email rollback by returning the endpoint to dry-run mode

SMTP AUTH should not be the first choice. Microsoft documents OAuth support for SMTP AUTH, but also documents the removal of Basic authentication for SMTP client submission in March 2026. Since this preflight is dated 2026-06-05, mailbox-password SMTP is not an acceptable production plan.

## Future Required Approvals

Separate explicit approval is required before any of these steps:

- create or modify a Microsoft Entra app or managed identity permissions
- create or modify Exchange Online RBAC/Application Access Policy scope
- create or modify Microsoft 365 mailbox, recipient, Send As, or Send on behalf settings
- add Azure Function app settings or Key Vault references
- change endpoint code for Graph/email delivery
- redeploy the Function endpoint
- send one approved test email submission
- transition validators from no-email verified to production email verified
- mark contact form production readiness `yes`

## Required Future Settings

Placeholders only:

```text
FORM_DELIVERY_MODE=<dry-run|m365-graph>
STATIC_FORM_FORWARD_MODE=<dry-run compatibility until delivery dispatcher is implemented>
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals
ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY=ice-rink-rentals-default
ICE_RINK_RENTALS_LEAD_RECIPIENT_REF=ICE_RINK_RENTALS_LEAD_RECIPIENT
ICE_RINK_RENTALS_LEAD_RECIPIENT_EMAIL=<approved recipient mailbox or distribution group>
FORM_EMAIL_FROM_ADDRESS=contact@iceskatingrinkrentals.com
FORM_EMAIL_REPLY_TO_MODE=<submitter-email-or-approved-static-reply-to>
FORM_EMAIL_SUBJECT_PREFIX=<approved subject prefix>
MICROSOFT_GRAPH_AUTH_MODE=<managed-identity-or-client-credential>
MICROSOFT_TENANT_ID=<tenant id>
MICROSOFT_GRAPH_CLIENT_ID=<managed identity client id or app client id>
MICROSOFT_GRAPH_CLIENT_SECRET -> <Key Vault reference or approved server-side secret, if not using managed identity>
MICROSOFT_GRAPH_SENDER_UPN=contact@iceskatingrinkrentals.com
MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS=<true-or-false>
STATIC_FORM_RATE_LIMIT_MODE=<approved durable mode>
STATIC_FORM_SPAM_PROTECTION_MODE=<approved mode>
STATIC_FORM_MAX_BODY_BYTES=20000
STATIC_FORM_MAX_MESSAGE_LENGTH=4000
```

## Verification Plan

Future production email verification must be explicit and ordered:

1. Approve Microsoft 365/email setup.
2. Approve endpoint code changes for a Graph delivery dispatcher while preserving dry-run.
3. Configure Microsoft Graph access and mailbox scope.
4. Configure server-side Function app settings or Key Vault references.
5. Deploy the updated endpoint only after deployment approval.
6. Run safe invalid-payload checks with no email expected.
7. Send exactly one approved test submission.
8. Verify Graph accepts the message and the approved recipient actually receives it.
9. Verify responses remain safe and do not expose recipient internals or secrets.
10. Rerun Ice static export with the production email verified endpoint context.
11. Rerun strict static output and staging package validators.
12. Only then consider `STATIC_FORM_ENDPOINT_VERIFIED=true` for production email verified context and contact form production readiness.

Graph `sendMail` acceptance is not enough by itself; Microsoft documents a successful response as `202 Accepted`, and delivery is still subject to Exchange Online processing and limits.

## Rollback Plan

Future rollback should not require static route or media changes:

- set `FORM_DELIVERY_MODE=dry-run` or restore `STATIC_FORM_FORWARD_MODE=dry-run`
- remove or disable Graph/email app settings
- revoke or disable the email app credential if compromise is suspected
- remove or narrow Exchange Online app mailbox scope
- leave `/api/static-contact` online in no-email mode if static validators still need URL availability
- clear production email verified status until another approved email delivery test passes

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| static form no-email endpoint deployed | yes |
| static form no-email validator wiring | yes |
| static output quality gates | yes for local/staging no-email validation context |
| contact form production readiness | no |
| real email delivery readiness | pending explicit approval |
| Microsoft 365/email setup readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Official References

- Microsoft Graph `sendMail`: https://learn.microsoft.com/en-us/graph/api/user-sendmail
- Microsoft Graph permissions overview: https://learn.microsoft.com/en-us/graph/permissions-overview
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Exchange Online RBAC for Applications: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
- Exchange Online Application Access Policies legacy note: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-access-policies
- Exchange Online Basic authentication deprecation: https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online
- Exchange Online SMTP AUTH settings: https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/authenticated-client-smtp-submission
- Azure App Service/Functions Key Vault references: https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references
