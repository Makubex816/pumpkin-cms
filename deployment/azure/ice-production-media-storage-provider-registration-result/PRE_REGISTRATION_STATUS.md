# Pre-Registration Status

Generated: 2026-06-04

## Command Run

```powershell
az provider show --namespace Microsoft.Storage --query "{namespace:namespace, registrationState:registrationState}" -o table
```

## Result

```text
Namespace: Microsoft.Storage
Registration state: NotRegistered
```

## Decision

Because `Microsoft.Storage` was `NotRegistered`, the approved provider registration action was needed.

No other provider was checked or registered.
