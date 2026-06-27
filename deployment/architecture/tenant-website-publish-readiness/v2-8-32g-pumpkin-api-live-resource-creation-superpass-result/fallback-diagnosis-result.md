# Fallback Diagnosis Result

Date: 2026-06-27

## Diagnosis

The fallback policy successfully found a same-subscription Azure target after East US and East US 2 quota blockers.

| Area | Result |
| --- | --- |
| Artifact | Ready |
| Runtime | Ready |
| Primary East US | Quota blocked |
| Existing plan fallback | No suitable plan |
| East US 2 fallback | Quota blocked |
| Central US fallback | Resource group, plan, and Web App created |
| ZIP deployment | Failed server-side with HTTP `400` |
| Health checks | Not run |

## Active Blocker

`deployment_server_side_400_diagnostics_required`
