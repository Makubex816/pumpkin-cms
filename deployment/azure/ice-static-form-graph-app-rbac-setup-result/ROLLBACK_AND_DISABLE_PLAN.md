# Rollback And Disable Plan

Generated: 2026-06-05
Updated: 2026-06-06

## Current State

The app has no credential, no active Entra app role assignment, and no Exchange mailbox-scope role assignment. It cannot send mail in the current state.

Exchange service-principal pointer now exists:

```text
0f2df0f4-4b1d-476f-be2a-74fd980d09a0
```

## Disable Options

Future approved rollback options:

- remove the Exchange service-principal pointer
- remove the app registration `Ice Static Contact Form Mailer`
- remove the tenant service principal
- remove required Graph `Mail.Send` permission from the app
- ensure no admin consent/app-role assignment exists
- remove any future Exchange management role assignment/scope

## Function Safety

The Function App remains:

```text
dry-run/no-email
```

No Function app setting rollback is needed from this pass because no Function app settings were changed.

