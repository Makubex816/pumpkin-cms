# Post-Assignment Verification

Generated: 2026-06-04

## Commands Run

Read-only role assignment list commands were run for the current principal at the approved container scope.

Output was limited to:

- `roleDefinitionName`
- `scope`
- `principalType`

## Verification Result

Assignments visible at the approved container scope, including inherited roles:

| Role definition name | Scope | Principal type |
| --- | --- | --- |
| `Owner` | `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873` | `User` |
| `Storage Blob Data Contributor` | `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia/blobServices/default/containers/ice-rink-rentals-media` | `User` |

Exact approved assignment exists:

```text
yes
```

## Safety Result

Verification was read-only.

No additional role assignments were created or deleted.
