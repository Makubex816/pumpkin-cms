# Subscription Context

Generated: 2026-06-04

## Intended Read-Only Discovery

If Azure CLI were available and already logged in, the intended read-only command would be:

```powershell
az account show --query '{name:name,id:id}' -o json
```

Tenant ID was not requested or printed.

## Result

Subscription context:

```text
not discovered
```

Reason:

```text
Azure CLI is unavailable in this terminal.
```

## Safety Result

- no access tokens printed
- no tenant secrets printed
- no subscription secrets printed
- no credentials read
- no protected config read
