# Pumpkin Ice Static Form Graph App RBAC Setup Result Report

Generated: 2026-06-05

## Scope

Approved action: Ice Microsoft 365 Graph app and mailbox-scope setup only.

No client secret was created. No client secret, token, key, connection string, API key, JWT, or credential was printed. No Azure Function app settings were changed. The endpoint was not redeployed. No real email was sent. No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. No protected config was read. Roller remains paused.

## Result

Partial success:

- Microsoft Entra app registration was created.
- Tenant service principal was created.
- Microsoft Graph `Mail.Send` application permission was added as a required permission.
- No admin consent was granted.
- Exchange Online RBAC for Applications mailbox scope was not configured because required Exchange Online PowerShell tooling is not available in this environment.

Admin consent was intentionally not granted because Exchange mailbox scoping could not be completed here. Granting unscoped Graph `Mail.Send` consent before mailbox scope would create broad tenant-wide send capability.

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
| Microsoft Graph application permission requested | `Mail.Send` |
| Mail.Send app role id | `b633e1c5-b582-4048-a93e-9f11b44c7e96` |
| App role assignments / admin consent | `0` |
| Mail.Send active assignment | `0` |
| Broader mail permissions added | no |

## Mailbox Scope State

Target mailbox identity:

```text
contact@iceskatingrinkrentals.com
```

Read-only Entra identity lookup resolved the user/mail identity. Exchange mailbox-level verification and RBAC assignment were blocked because these commands/modules are unavailable locally:

- `Connect-ExchangeOnline`
- `Get-EXOMailbox`
- `New-ServicePrincipal`
- `New-ManagementScope`
- `New-ManagementRoleAssignment`
- `Test-ServicePrincipalAuthorization`

## Next Required Step

Run the Exchange Online RBAC setup from an approved admin workstation/session with the ExchangeOnlineManagement module, then grant only the scoped application access. Do not grant broad unscoped Graph `Mail.Send` admin consent unless the approved Exchange scoping plan explicitly accounts for Microsoft’s additive permission behavior.

Expected future Exchange RBAC shape:

```powershell
Connect-ExchangeOnline -UserPrincipalName <approved Exchange admin>
New-ServicePrincipal -AppId 423390e3-63ee-4c53-bc87-c87f59958f13 -ObjectId 0f2df0f4-4b1d-476f-be2a-74fd980d09a0 -DisplayName "Ice Static Contact Form Mailer"
New-ManagementScope -Name "Ice Static Contact Form Mailer - contact mailbox" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'contact@iceskatingrinkrentals.com'"
New-ManagementRoleAssignment -Name "Ice Static Contact Form Mailer - Application Mail.Send - contact" -Role "Application Mail.Send" -App "Ice Static Contact Form Mailer" -CustomResourceScope "Ice Static Contact Form Mailer - contact mailbox"
Test-ServicePrincipalAuthorization -Identity "Ice Static Contact Form Mailer" -Resource contact@iceskatingrinkrentals.com
```

These commands were not run in this pass.

## Function Endpoint State

Safe Function app setting status check by name/status only:

| Check | Result |
| --- | --- |
| `STATIC_FORM_FORWARD_MODE` is dry-run | true |
| `FORM_DELIVERY_MODE` active Graph/m365-Graph | false |
| Microsoft Graph Function app setting name count | 0 |

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| Graph-capable Function code deployed | yes |
| Microsoft Graph app registration | yes |
| Mail.Send permission configured | requested, not consented |
| Admin consent granted | no |
| Exchange RBAC mailbox scope configured | no, blocked by unavailable Exchange Online tooling |
| client secret/app credential readiness | no |
| contact form production readiness | no |
| real email delivery readiness | pending Exchange RBAC/admin consent strategy/app credential/app settings/live-test approval |
| Microsoft 365/email setup readiness | partial |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Official References

- Microsoft Graph `sendMail`: https://learn.microsoft.com/en-us/graph/api/user-sendmail
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Exchange Online RBAC for Applications: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
- Microsoft identity client credentials flow: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow

