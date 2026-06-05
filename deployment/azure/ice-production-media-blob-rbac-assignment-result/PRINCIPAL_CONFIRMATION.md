# Principal Confirmation

Generated: 2026-06-04

## Commands Run

```powershell
az ad signed-in-user show --query "{id:id, userPrincipalName:userPrincipalName, displayName:displayName}" -o table
az ad signed-in-user show --query "{objectId:id, userPrincipalName:userPrincipalName, displayName:displayName}" -o table
```

The `objectId` alias was used because Azure CLI table output omitted the field named `id`.

## Result

```text
Object ID: 66783b82-3ed1-48c6-8a99-ca190faae1e0
User principal name: Contact@iceskatingrinkrentals.com
Display name: Steven Benedetto
```

## Approval Match

The signed-in principal matched the approved assignee:

```text
Contact@iceskatingrinkrentals.com
```

## Safety Result

No tokens, credentials, or protected config values were printed or read.
