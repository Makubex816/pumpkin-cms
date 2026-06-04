# Login Options

Generated: 2026-06-04

## Scope

Planning only. No Azure login was performed in this run.

## Basic Login

After Azure CLI is installed, the user may log in:

```powershell
az login
```

Use only the account authorized for Ice production media discovery.

## Confirm Account Context

Future read-only check:

```powershell
az account show --query "{name:name,id:id}" -o json
```

This prints subscription name and ID only. Do not print access tokens.

## Select Subscription Only If Needed

If the wrong subscription is active, the user may select the intended subscription:

```powershell
az account set --subscription "<SUBSCRIPTION_NAME_OR_ID>"
```

This is account-context selection, not resource creation.

## Do Not Run

Do not run commands that print or retrieve secrets:

- `az account get-access-token`
- `az storage account keys list`
- connection string listing commands
- SAS generation commands

## Current Run Result

No `az login` command was run. No subscription was selected.
