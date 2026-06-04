# Azure CLI Status

Generated: 2026-06-04

## Commands Attempted

Read-only availability check:

```powershell
Get-Command az -ErrorAction SilentlyContinue
```

Version check attempted only if `az` was present:

```powershell
az version --query '"azure-cli"' -o tsv
```

Account check attempted only if `az` was present:

```powershell
az account show --query '{name:name,id:id}' -o json
```

## Result

Azure CLI availability:

```text
MISSING
```

Azure CLI version:

```text
not checked because az is unavailable
```

Azure login/account status:

```text
not checked because az is unavailable
```

## Blocker

Azure CLI is not available in this terminal session.

## Required User Action

Install Azure CLI or open a terminal/session where Azure CLI is available and already logged in, then rerun the approved read-only discovery.

No credentials, tokens, keys, connection strings, or protected config values should be printed.
