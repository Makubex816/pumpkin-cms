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

No tokens were printed.

## ExchangeOnlineManagement

Initial state:

```text
ExchangeOnlineManagement module: not available
```

Approved action performed:

```text
NuGet provider installed for CurrentUser
ExchangeOnlineManagement installed/imported for CurrentUser
ExchangeOnlineManagement version 3.9.2
```

Exchange Online connection:

```text
connected with active Azure CLI identity/token
tokens not printed
```

Available after connection:

- `Get-EXOMailbox`
- `New-ServicePrincipal`
- `Get-ServicePrincipal`
- `New-ManagementScope`
- `Get-ManagementScope`
- `New-ManagementRoleAssignment`
- `Get-ManagementRoleAssignment`
- `Test-ServicePrincipalAuthorization`

## Consent Safety Decision

Microsoft documents that Microsoft Entra permissions and Exchange RBAC permissions are additive. Because this project requires mailbox-only access for `contact@iceskatingrinkrentals.com`, broad Entra admin consent for `Mail.Send` was not granted in this pass.

