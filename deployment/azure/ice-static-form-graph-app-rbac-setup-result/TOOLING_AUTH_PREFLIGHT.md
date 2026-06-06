# Tooling Auth Preflight

Generated: 2026-06-05
Updated: 2026-06-06

## Azure CLI

Azure CLI:

```text
available
version 2.87.0
```

Azure account:

```text
state=Enabled
isDefault=True
tenantId=38b16667-a82c-4ff8-98d8-aeebbec4536a
```

Signed-in user:

```text
Contact@iceskatingrinkrentals.com
```

No access tokens were printed.

## ExchangeOnlineManagement

Available module:

```text
ExchangeOnlineManagement version 3.9.2
```

Exchange Online connection:

```text
connected with active Azure CLI identity/token
access token not printed
```

Commands used:

- `Get-OrganizationConfig`
- `Enable-OrganizationCustomization`
- `Get-EXOMailbox`
- `Get-ServicePrincipal`
- `Get-ManagementScope`
- `New-ManagementScope`
- `Get-ManagementRoleAssignment`
- `New-ManagementRoleAssignment`
- `Test-ServicePrincipalAuthorization`

## Consent Safety Decision

Microsoft documents that Microsoft Entra permissions and Exchange RBAC permissions are additive. Admin consent for Graph `Mail.Send` was granted only after Exchange RBAC verified the app was in scope for the target mailbox.
