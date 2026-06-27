# Current State Summary

Date: 2026-06-27

## Status

The Pumpkin API has a selected same-subscription fallback Web App in Central US, but ZIP deployment failed server-side with HTTP `400`.

## Current State

| Gate | Status |
| --- | --- |
| Subscription lock | Passed |
| Artifact | Ready |
| Linux runtime | Ready |
| Primary East US | Quota blocked |
| Existing suitable plan | None found |
| East US 2 fallback | Quota blocked |
| Central US fallback plan | Created |
| Central US Web App | Created and running |
| ZIP deployment | Failed server-side with HTTP `400` |
| Health checks | Not run |

## Active Blocker

`deployment_server_side_400_diagnostics_required`

## Selected Target

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

This URL is not canonical for provider binding until `/health` and `/api/health` pass.
