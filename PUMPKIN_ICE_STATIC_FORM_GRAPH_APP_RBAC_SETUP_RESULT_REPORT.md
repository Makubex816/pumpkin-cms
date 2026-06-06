# Pumpkin Ice Static Form Graph App RBAC Setup Result Report

Generated: 2026-06-05
Updated: 2026-06-06

## Scope

Approved action: Ice Microsoft Graph admin consent and Exchange mailbox-scope setup only.

No client secret was created. No certificate was created. No client secret, token, key, connection string, API key, JWT, or credential was printed. No Azure Function app settings were changed. The endpoint was not redeployed. No real email was sent. No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. No protected config was read. Roller remains paused.

## Result

Partial success with a specific Exchange blocker:

- Existing Microsoft Entra app registration was reused.
- Existing service principal was reused.
- Microsoft Graph `Mail.Send` remains present as a required application permission.
- ExchangeOnlineManagement was installed/imported for the current user.
- Exchange Online connection succeeded without printing tokens.
- Target mailbox resolved as a `UserMailbox`.
- Exchange service-principal pointer was created.
- Exchange management scope and role assignment were blocked by the tenant prerequisite `Enable-OrganizationCustomization`.
- Admin consent was not granted because Microsoft documents Entra permissions and Exchange RBAC permissions as additive; granting unscoped Entra `Mail.Send` would undermine the mailbox-only RBAC intent.

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
| Entra app role assignments / admin consent | `0` |
| Mail.Send active Entra assignment | `0` |
| Broader mail permissions added | no |

## Exchange RBAC State

Target mailbox:

```text
contact@iceskatingrinkrentals.com
```

Read-only Exchange verification:

| Check | Result |
| --- | --- |
| mailbox primary SMTP | `Contact@iceskatingrinkrentals.com` |
| mailbox type | `UserMailbox` |
| Exchange service-principal pointer | exists |
| management scope | not created |
| role assignment | not created |
| `Application Mail.Send` in scope | false |

Blocked command:

```text
New-ManagementScope
```

Exact Microsoft error:

```text
The command you tried to run isn't currently allowed in your organization. To run this command, you first need to run the command: Enable-OrganizationCustomization.
```

`Enable-OrganizationCustomization` was not run because it is a tenant-level Exchange organization change and was not included in this approval.

## Next Required Step

Separate approval is required to run `Enable-OrganizationCustomization`, then complete the mailbox-only RBAC scope:

```powershell
Connect-ExchangeOnline -UserPrincipalName <approved Exchange admin>
Enable-OrganizationCustomization
New-ManagementScope -Name "Ice Static Contact Form Mailer - contact mailbox" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'contact@iceskatingrinkrentals.com'"
New-ManagementRoleAssignment -Name "Ice Static Contact Form Mailer - Application Mail.Send - contact" -Role "Application Mail.Send" -App 0f2df0f4-4b1d-476f-be2a-74fd980d09a0 -CustomResourceScope "Ice Static Contact Form Mailer - contact mailbox"
Test-ServicePrincipalAuthorization -Identity 0f2df0f4-4b1d-476f-be2a-74fd980d09a0 -Resource contact@iceskatingrinkrentals.com
```

These commands were not completed in this pass beyond creating the Exchange service-principal pointer.

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
| Mail.Send permission configured | required permission present, not Entra-consented |
| Admin consent granted | no, skipped to avoid unscoped Mail.Send |
| Exchange RBAC mailbox scope configured | no, blocked by `Enable-OrganizationCustomization` prerequisite |
| Exchange service-principal pointer | yes |
| client secret/app credential readiness | no |
| contact form production readiness | no |
| real email delivery readiness | pending org customization/RBAC scope/app credential/app settings/live-test approval |
| Microsoft 365/email setup readiness | partial |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Official References

- Microsoft Graph `sendMail`: https://learn.microsoft.com/en-us/graph/api/user-sendmail
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Exchange Online RBAC for Applications: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
- Connect to Exchange Online PowerShell: https://learn.microsoft.com/en-us/powershell/module/exchange/connect-exchangeonline

