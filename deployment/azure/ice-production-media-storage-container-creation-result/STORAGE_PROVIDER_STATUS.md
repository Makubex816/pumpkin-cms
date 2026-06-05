# Storage Provider Status

Generated: 2026-06-04

## Command Run

```powershell
az provider show --namespace Microsoft.Storage --query "{namespace:namespace, registrationState:registrationState}" -o table
```

## Result

```text
Namespace: Microsoft.Storage
Registration state: Registered
```

## Interpretation

The prior Microsoft.Storage provider blocker was resolved before storage account creation.

No provider registration command was run in this storage/container creation pass.
