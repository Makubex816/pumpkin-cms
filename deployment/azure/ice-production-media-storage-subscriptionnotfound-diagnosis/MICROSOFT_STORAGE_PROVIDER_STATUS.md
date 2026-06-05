# Microsoft.Storage Provider Status

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

## Interpretation

`Microsoft.Storage` is not registered for the active subscription.

This is the strongest read-only signal found during the diagnosis. It plausibly explains why Storage resource provider operations, including storage account name availability checks and storage account creation, return `SubscriptionNotFound` even though the subscription is visible and enabled for account and resource group operations.

## Required Boundary

No provider registration was performed in this pass.

Running the following command is forbidden in this diagnosis run and requires separate explicit approval:

```powershell
az provider register --namespace Microsoft.Storage
```

## Safety Result

No resource providers were registered or modified.
