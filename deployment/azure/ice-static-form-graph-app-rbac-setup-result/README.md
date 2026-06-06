# Ice Static Form Graph App RBAC Setup Result

Generated: 2026-06-05
Updated: 2026-06-06

## Result

Partial success.

The existing Ice-specific Microsoft Entra app and service principal were reused. Microsoft Graph `Mail.Send` remains configured as a required application permission. ExchangeOnlineManagement was installed/imported, Exchange Online connection succeeded, the contact mailbox was verified as a `UserMailbox`, and the Exchange service-principal pointer now exists.

Mailbox-scoped RBAC could not be completed because Exchange returned the tenant prerequisite:

```text
Enable-OrganizationCustomization
```

That tenant-level command was not approved in this pass, so the management scope and `Application Mail.Send` role assignment were not created.

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
Exchange service-principal pointer: yes
Exchange mailbox scope configured: no
real email sent: no
Function app settings changed: no
endpoint redeployed: no
```

Contact form production readiness remains:

```text
no
```

