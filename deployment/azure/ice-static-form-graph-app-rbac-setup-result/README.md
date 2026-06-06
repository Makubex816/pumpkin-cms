# Ice Static Form Graph App RBAC Setup Result

Generated: 2026-06-05
Updated: 2026-06-06

## Result

Completed within the approved scope.

`Get-OrganizationConfig` reported `IsDehydrated=true`, so `Enable-OrganizationCustomization` was run. Exchange then reported `IsDehydrated=false`. The existing Ice-specific Microsoft Entra app, tenant service principal, and Exchange service-principal pointer were reused.

The mailbox-scoped Exchange RBAC setup now exists for `contact@iceskatingrinkrentals.com`, and Microsoft Graph `Mail.Send` admin consent was granted only after `Test-ServicePrincipalAuthorization` verified the app is in scope for that mailbox.

## App

| Field | Value |
| --- | --- |
| Display name | `Ice Static Contact Form Mailer` |
| Application/client id | `423390e3-63ee-4c53-bc87-c87f59958f13` |
| App registration object id | `75ddecd2-8c21-4663-bafe-fdbf9682eaea` |
| Service principal object id | `0f2df0f4-4b1d-476f-be2a-74fd980d09a0` |

## Safety State

```text
client secret created: no
certificate created: no
admin consent granted: yes, Mail.Send only
Exchange service-principal pointer: yes
Exchange mailbox scope configured: yes
real email sent: no
Function app settings changed: no
endpoint redeployed: no
```

Function delivery remains dry-run/no-email until separate approval adds Graph delivery settings and validates one live email.

Contact form production readiness remains:

```text
no
```
