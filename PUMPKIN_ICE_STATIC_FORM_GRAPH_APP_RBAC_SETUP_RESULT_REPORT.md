# Pumpkin Ice Static Form Graph App RBAC Setup Result Report

Generated: 2026-06-05
Updated: 2026-06-06

## Scope

Approved action: Ice Exchange organization customization and mailbox-scoped Graph mail setup only.

No client secret was created. No certificate was created. No Azure Function app settings were changed. The endpoint was not redeployed. No real email was sent. No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. Roller remains paused.

Operational note: a later Azure Function app-setting verification was rerun with exact-name redaction after one diagnostic summary exposed a protected Azure storage setting value in the command transcript. That value was not written to repo files, no app settings were changed, and no Graph/client credential was created. Treat that storage value as exposed in this session log and rotate it under a separate Azure approval if required.

## Result

Completed within the approved scope:

- `Get-OrganizationConfig` reported `IsDehydrated=true`.
- `Enable-OrganizationCustomization` was run because that condition was true.
- Follow-up `Get-OrganizationConfig` reported `IsDehydrated=false`.
- The existing Microsoft Entra app registration and service principal were reused.
- The existing Exchange service-principal pointer was reused.
- The target mailbox resolved as a `UserMailbox`.
- A mailbox management scope was created for `contact@iceskatingrinkrentals.com`.
- An `Application Mail.Send` Exchange role assignment was created for the Ice app and that mailbox scope.
- `Test-ServicePrincipalAuthorization` returned `InScope=True` for `Application Mail.Send` on the contact mailbox.
- Microsoft Graph `Mail.Send` admin consent was granted only after the Exchange mailbox scope verified.

## App Registration

| Field | Value |
| --- | --- |
| Display name | `Ice Static Contact Form Mailer` |
| Application/client id | `423390e3-63ee-4c53-bc87-c87f59958f13` |
| App registration object id | `75ddecd2-8c21-4663-bafe-fdbf9682eaea` |
| Service principal object id | `0f2df0f4-4b1d-476f-be2a-74fd980d09a0` |
| Tenant id | `38b16667-a82c-4ff8-98d8-aeebbec4536a` |
| Client secret/certificate count | `0` |

## Permission State

| Check | Result |
| --- | --- |
| Microsoft Graph required application permission | `Mail.Send` |
| Mail.Send app role id | `b633e1c5-b582-4048-a93e-9f11b44c7e96` |
| Entra app role assignment count | `1` |
| Mail.Send active Entra assignment count | `1` |
| Broader mail permissions added | no |

## Exchange RBAC State

Target mailbox:

```text
contact@iceskatingrinkrentals.com
```

Exchange verification:

| Check | Result |
| --- | --- |
| mailbox primary SMTP | `Contact@iceskatingrinkrentals.com` |
| mailbox type | `UserMailbox` |
| `IsDehydrated` after setup | `false` |
| Exchange service-principal pointer | exists |
| management scope | `Ice Static Contact Form Mailer - contact mailbox` |
| management scope filter | `PrimarySmtpAddress -eq 'contact@iceskatingrinkrentals.com'` |
| role assignment | `Ice Static Contact Form Mailer - Application Mail.Send - contact` |
| assigned role | `Application Mail.Send` |
| assignment app | `0f2df0f4-4b1d-476f-be2a-74fd980d09a0` |
| `Application Mail.Send` in scope for contact mailbox | true |

Authorization test result:

```text
RoleName=Application Mail.Send
GrantedPermissions=Mail.Send
AllowedResourceScope=Ice Static Contact Form Mailer - contact mailbox
ScopeType=CustomRecipientScope
InScope=True
```

## Function Endpoint State

Safe Function app setting status check:

| Check | Result |
| --- | --- |
| endpoint URL | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| `STATIC_FORM_FORWARD_MODE` | `dry-run` |
| `FORM_DELIVERY_MODE` active Graph/m365-Graph | false |
| Microsoft Graph Function app setting name count | `0` |
| `MICROSOFT_GRAPH_CLIENT_SECRET` setting present | false |
| `ICE_RINK_RENTALS_LEAD_RECIPIENT` setting present | false |

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| Graph-capable Function code deployed | yes |
| Microsoft Graph app registration | yes |
| Mail.Send permission configured | yes |
| Admin consent granted | yes |
| Exchange RBAC mailbox scope configured | yes |
| Exchange service-principal pointer | yes |
| client secret/app credential readiness | no |
| Function Graph delivery settings configured | no |
| contact form production readiness | no |
| real email delivery readiness | pending app credential/settings/restart or redeploy/live-test approval |
| Microsoft 365/email setup readiness | partial |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Next Required Step

Separate approval is still required before real email can be sent:

- create an approved app credential, certificate, Key Vault reference, or managed identity path
- configure Azure Function Graph app settings
- activate `FORM_DELIVERY_MODE=graph`
- restart or redeploy only if approved
- send one approved live test email
- verify receipt and validator transition to production email verified

## Official References

- Enable organization customization: https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/enable-organizationcustomization
- Exchange Online RBAC for Applications: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
- Microsoft Graph `sendMail`: https://learn.microsoft.com/en-us/graph/api/user-sendmail
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
