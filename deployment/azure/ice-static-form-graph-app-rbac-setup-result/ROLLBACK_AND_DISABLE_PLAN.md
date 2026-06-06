# Rollback And Disable Plan

Generated: 2026-06-05

## Current State

The app has no credential, no active app role assignment, and no Exchange RBAC scope. It cannot send mail in the current state.

## Disable Options

Future approved rollback options:

- remove the app registration `Ice Static Contact Form Mailer`
- remove the service principal
- remove required Graph `Mail.Send` permission from the app
- ensure no admin consent/app-role assignment exists
- remove any future Exchange service principal pointer
- remove any future Exchange management role assignment/scope

## Function Safety

The Function App remains:

```text
dry-run/no-email
```

No Function app setting rollback is needed from this pass because no Function app settings were changed.

