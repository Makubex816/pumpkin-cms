# Exchange RBAC Result

Generated: 2026-06-05
Updated: 2026-06-06

## Result

Exchange RBAC setup partially completed.

Created or verified:

- Exchange Online connection succeeded.
- Target mailbox resolved as a `UserMailbox`.
- Exchange service-principal pointer exists for `Ice Static Contact Form Mailer`.

Not completed:

- management scope for the contact mailbox
- `Application Mail.Send` role assignment
- successful `Test-ServicePrincipalAuthorization` in-scope result

## Exact Blocker

The first role-scope creation command failed:

```text
New-ManagementScope
```

Exchange Online returned:

```text
The command you tried to run isn't currently allowed in your organization. To run this command, you first need to run the command: Enable-OrganizationCustomization.
```

`Enable-OrganizationCustomization` was not run because it is a tenant-level Exchange organization change and was not included in this approval.

## Current Verification

| Check | Result |
| --- | --- |
| Exchange service-principal pointer exists | true |
| Management scope exists | false |
| Role assignment exists | false |
| `Application Mail.Send` in scope for contact mailbox | false |

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
Enable-OrganizationCustomization
New-ManagementScope -Name "Ice Static Contact Form Mailer - contact mailbox" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'contact@iceskatingrinkrentals.com'"
New-ManagementRoleAssignment -Name "Ice Static Contact Form Mailer - Application Mail.Send - contact" -Role "Application Mail.Send" -App 0f2df0f4-4b1d-476f-be2a-74fd980d09a0 -CustomResourceScope "Ice Static Contact Form Mailer - contact mailbox"
Test-ServicePrincipalAuthorization -Identity 0f2df0f4-4b1d-476f-be2a-74fd980d09a0 -Resource contact@iceskatingrinkrentals.com
```

Only the Exchange service-principal pointer portion was completed in this pass.

