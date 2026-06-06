# Ice Static Form Graph App RBAC Setup Result

Generated: 2026-06-05

## Result

Partial success.

The Ice-specific Microsoft Entra app registration and service principal were created, and Microsoft Graph `Mail.Send` application permission was added as a required permission. Admin consent and Exchange Online mailbox-scope RBAC were not completed because Exchange Online PowerShell tooling is unavailable in this local environment.

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
admin consent granted: no
Exchange RBAC mailbox scope configured: no
real email sent: no
Function app settings changed: no
endpoint redeployed: no
```

Contact form production readiness remains:

```text
no
```

