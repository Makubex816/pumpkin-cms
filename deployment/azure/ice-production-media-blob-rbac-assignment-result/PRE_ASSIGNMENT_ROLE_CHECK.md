# Pre-Assignment Role Check

Generated: 2026-06-04

## Principal

```text
Object ID: 66783b82-3ed1-48c6-8a99-ca190faae1e0
User principal name: Contact@iceskatingrinkrentals.com
```

## Scopes Checked

Approved container scope:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia/blobServices/default/containers/ice-rink-rentals-media
```

Storage account scope:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia
```

## Commands Run

Read-only role assignment list commands were run for the current principal at the approved container scope and storage account scope. Output was limited to:

- `roleDefinitionName`
- `scope`
- `principalType`

## Result Before Assignment

Both checked scopes showed only the inherited subscription assignment:

| Role definition name | Scope | Principal type |
| --- | --- | --- |
| `Owner` | `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873` | `User` |

## Approved Role Pre-Existence

`Storage Blob Data Contributor` at the approved container scope:

```text
missing
```

## Decision

Because the approved role was missing at the approved container scope, the role assignment was created.
