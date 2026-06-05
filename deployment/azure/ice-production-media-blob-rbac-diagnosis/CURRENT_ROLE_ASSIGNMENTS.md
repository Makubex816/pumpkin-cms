# Current Role Assignments

Generated: 2026-06-04

## Principal

```text
Object ID: 66783b82-3ed1-48c6-8a99-ca190faae1e0
User principal name: Contact@iceskatingrinkrentals.com
```

## Scopes Checked

Subscription scope:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873
```

Resource group scope:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media
```

Storage account scope:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia
```

Blob container scope:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia/blobServices/default/containers/ice-rink-rentals-media
```

## Commands Run

Read-only role assignment list commands were run for the current principal at the scopes above. Output was limited to:

- `roleDefinitionName`
- `scope`
- `principalType`

## Result

All checked scopes showed the same inherited assignment:

| Role definition name | Scope | Principal type | Blob data-plane access |
| --- | --- | --- | --- |
| `Owner` | `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873` | `User` | no direct Blob data-plane read/upload grant |

## Blob Data Roles Found

```text
none
```

No `Storage Blob Data Reader`, `Storage Blob Data Contributor`, or `Storage Blob Data Owner` assignment was found for the current principal at the checked scopes.

## Interpretation

The current principal has management-plane ownership but lacks the Blob data-plane role needed to list blobs or upload media using Microsoft Entra login auth.

## Safety Result

No role assignments were created, modified, or deleted.
