# Rollback And Disable Plan

Generated: 2026-06-05
Updated: 2026-06-06

## Current State

The app has Microsoft Graph `Mail.Send` admin consent and an Exchange `Application Mail.Send` role assignment scoped to `contact@iceskatingrinkrentals.com`.

The app still has no client secret or certificate, and the Function App remains dry-run/no-email with no Microsoft Graph app settings. It cannot send real email through the deployed Function in the current state.

Exchange objects:

```text
Service principal object id: 0f2df0f4-4b1d-476f-be2a-74fd980d09a0
Management scope: Ice Static Contact Form Mailer - contact mailbox
Role assignment: Ice Static Contact Form Mailer - Application Mail.Send - contact
```

## Future Approved Disable Options

- remove the Exchange management role assignment
- remove the Exchange management scope
- remove the Exchange service-principal pointer
- remove the Microsoft Graph `Mail.Send` app-role assignment/admin consent
- remove required Graph `Mail.Send` permission from the app
- remove the app registration `Ice Static Contact Form Mailer`
- remove the tenant service principal

## Function Safety

The Function App remains:

```text
dry-run/no-email
```

No Function app setting rollback is needed from this pass because no Function app settings were changed.
