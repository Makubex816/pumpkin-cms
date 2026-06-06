# Admin Consent Result

Generated: 2026-06-05

## Result

Admin consent was not granted.

## Reason

Exchange Online RBAC for Applications could not be configured in this environment because ExchangeOnlineManagement tooling is unavailable. Granting Microsoft Graph `Mail.Send` application consent before mailbox scoping would create broad unscoped send capability.

## Verified State

```text
appRoleAssignmentCount=0
mailSendAssignmentCount=0
```

## Future Consent Decision

Before granting consent, confirm the approved scoping model:

- Exchange Online RBAC for Applications with `Application Mail.Send`, or
- another approved Microsoft-supported mailbox-scope mechanism

Do not grant broad unscoped `Mail.Send` admin consent as the final state.

