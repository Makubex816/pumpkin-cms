# Subscription Lock Proof

Date: 2026-06-27

## Lock

Expected subscription:

`ff887def-fd83-4a19-9298-13d4b1687873`

## Commands

The subscription was set before Azure resource commands:

```powershell
az account set --subscription ff887def-fd83-4a19-9298-13d4b1687873
az account show
```

## Verified Account

| Field | Value |
| --- | --- |
| Environment | `AzureCloud` |
| Subscription name | `Azure subscription 1` |
| Subscription id | `ff887def-fd83-4a19-9298-13d4b1687873` |
| State | `Enabled` |
| Tenant default domain | `iceskatingrinkrentals.com` |
| Operator user | `Contact@iceskatingrinkrentals.com` |

## Result

Subscription lock passed.

Confirmed resource ID prefix:

`/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/`
