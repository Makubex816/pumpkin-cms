# Subscription Lock Proof

Date: 2026-06-27

## Commands

```powershell
az account set --subscription ff887def-fd83-4a19-9298-13d4b1687873
az account show
```

## Verified Context

| Field | Value |
| --- | --- |
| Environment | `AzureCloud` |
| Subscription name | `Azure subscription 1` |
| Subscription id | `ff887def-fd83-4a19-9298-13d4b1687873` |
| State | `Enabled` |
| Tenant default domain | `iceskatingrinkrentals.com` |
| Operator user | `Contact@iceskatingrinkrentals.com` |

## Result

Subscription lock passed. Every created resource was under `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/`.
