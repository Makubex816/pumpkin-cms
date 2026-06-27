# Current State Summary

Date: 2026-06-27

## Status

V2.8.32E records the operator-submitted East US quota request and keeps the live Pumpkin API deployment blocked.

## Current Gate State

| Gate | Status |
| --- | --- |
| Path selection | Path A selected |
| East US quota request | Submitted by operator evidence |
| Quota approval | Pending |
| V2.8.32D deployment retry | Blocked until quota approval and renewed approval |
| Contact POST | Not approved |
| Protected provider binding | Not approved |

## Target

The target remains East US in subscription `ff887def-fd83-4a19-9298-13d4b1687873`.

| Resource | Name |
| --- | --- |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| App Service plan | `asp-pumpkin-api-prod-eastus-001` |
| Web App | `app-pumpkin-api-prod-eastus-001` |

## Decision

No alternate region, alternate SKU, alternate hosting target, deploy, protected config read, app settings operation, contact POST, DNS mutation, or indexing action occurred in this phase.
