# Exchange RBAC Result

Generated: 2026-06-05

## Result

Exchange Online RBAC for Applications was not configured.

## Exact Blocker

Required Exchange Online PowerShell tooling is unavailable in this environment:

```text
ExchangeOnlineManagement module: not available
Connect-ExchangeOnline: not available
Get-EXOMailbox: not available
New-ServicePrincipal: not available
New-ManagementScope: not available
New-ManagementRoleAssignment: not available
Test-ServicePrincipalAuthorization: not available
```

Per approval constraints, no new tooling was installed.

## Intended Future Scope

Target app:

```text
Ice Static Contact Form Mailer
Application/client id: 423390e3-63ee-4c53-bc87-c87f59958f13
Service principal object id: 0f2df0f4-4b1d-476f-be2a-74fd980d09a0
```

Target mailbox:

```text
contact@iceskatingrinkrentals.com
```

Expected future Exchange RBAC commands, documentation only:

```powershell
Connect-ExchangeOnline -UserPrincipalName <approved Exchange admin>
New-ServicePrincipal -AppId 423390e3-63ee-4c53-bc87-c87f59958f13 -ObjectId 0f2df0f4-4b1d-476f-be2a-74fd980d09a0 -DisplayName "Ice Static Contact Form Mailer"
New-ManagementScope -Name "Ice Static Contact Form Mailer - contact mailbox" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'contact@iceskatingrinkrentals.com'"
New-ManagementRoleAssignment -Name "Ice Static Contact Form Mailer - Application Mail.Send - contact" -Role "Application Mail.Send" -App "Ice Static Contact Form Mailer" -CustomResourceScope "Ice Static Contact Form Mailer - contact mailbox"
Test-ServicePrincipalAuthorization -Identity "Ice Static Contact Form Mailer" -Resource contact@iceskatingrinkrentals.com
```

These commands were not run.

