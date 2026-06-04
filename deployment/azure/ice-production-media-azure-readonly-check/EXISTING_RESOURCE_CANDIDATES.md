# Existing Resource Candidates

Generated: 2026-06-04

## Read-Only Discovery Commands

```powershell
az group list --query "[].{name:name, location:location}" -o table
az storage account list --query "[].{name:name, resourceGroup:resourceGroup, location:location}" -o table
az staticwebapp list --query "[].{name:name, resourceGroup:resourceGroup, location:location, defaultHostname:defaultHostname}" -o table
```

## Result

Resource candidate discovery:

```text
No visible resource groups, storage accounts, or Static Web Apps were returned in the active subscription.
```

## Candidate Categories

Ice production media storage account:

```text
no visible candidate found by name
```

Pumpkin media storage account:

```text
no visible candidate found by name
```

Static web/media hosting storage account:

```text
no visible candidate found by name
```

Ice/Pumpkin media resource group:

```text
no visible candidate found by name
```

Azure Static Web App resource group:

```text
no visible candidate found by name
```

Azure Static Web App instance:

```text
no visible candidate found by name
```

## Interpretation

The active subscription appears empty for the approved discovery surface. No likely existing Ice/Pumpkin media storage resources or Static Web App/resource group resources were found by name.

This is a read-only discovery result only. It is not approval to create any replacement resources.
