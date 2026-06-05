# Role Assignment Result

Generated: 2026-06-04

## Approved Role Assignment

Role:

```text
Storage Blob Data Contributor
```

Assignee object ID:

```text
66783b82-3ed1-48c6-8a99-ca190faae1e0
```

Assignee:

```text
Contact@iceskatingrinkrentals.com
```

Scope:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia/blobServices/default/containers/ice-rink-rentals-media
```

## Command Run

```powershell
az role assignment create --assignee-object-id 66783b82-3ed1-48c6-8a99-ca190faae1e0 --role "Storage Blob Data Contributor" --scope "/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia/blobServices/default/containers/ice-rink-rentals-media" --query "{roleDefinitionName:roleDefinitionName, scope:scope, principalType:principalType}" -o table
```

## Result

```text
created
```

Azure CLI returned the approved container scope and principal type `User`.

Azure CLI also printed a non-blocking warning that future RBAC service behavior may require specifying `--assignee-principal-type`.

## Safety Result

No broader-scope role assignment was created.

No different role was assigned.

No different principal was assigned.
