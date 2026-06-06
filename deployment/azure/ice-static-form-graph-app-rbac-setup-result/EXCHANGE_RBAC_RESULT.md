# Exchange RBAC Result

Generated: 2026-06-05
Updated: 2026-06-06

## Result

Exchange RBAC setup completed for the approved mailbox scope.

Created or verified:

- `Get-OrganizationConfig` initially returned `IsDehydrated=true`.
- `Enable-OrganizationCustomization` ran because the organization was dehydrated.
- Follow-up organization verification returned `IsDehydrated=false`.
- Target mailbox resolved as a `UserMailbox`.
- Exchange service-principal pointer exists for `Ice Static Contact Form Mailer`.
- Management scope exists for the contact mailbox.
- `Application Mail.Send` role assignment exists for the Ice app and that scope.
- `Test-ServicePrincipalAuthorization` reports the app is in scope for the contact mailbox.

## Scope

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

Management scope:

```text
Name=Ice Static Contact Form Mailer - contact mailbox
Filter=PrimarySmtpAddress -eq 'contact@iceskatingrinkrentals.com'
```

Role assignment:

```text
Name=Ice Static Contact Form Mailer - Application Mail.Send - contact
Role=Application Mail.Send
App=0f2df0f4-4b1d-476f-be2a-74fd980d09a0
CustomResourceScope=Ice Static Contact Form Mailer - contact mailbox
```

## Authorization Verification

```text
RoleName=Application Mail.Send
GrantedPermissions=Mail.Send
AllowedResourceScope=Ice Static Contact Form Mailer - contact mailbox
ScopeType=CustomRecipientScope
InScope=True
```

No real email was sent.
