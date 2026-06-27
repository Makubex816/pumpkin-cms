# Risk And Open Decisions

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Pumpkin API host is absent | Contact persistence cannot be enabled | Verify/create API host before any contact binding |
| Candidate API URL is stale | Static contact could point to a dead or wrong target | Treat publish-profile hint as non-authoritative |
| Admin and static contact bind to different APIs | Write succeeds but Admin visibility fails | Use a single verified API base URL for both |
| API provider points at staging or wrong database | Production contact data may be misplaced | Require non-secret provider metadata and Backup Center proof |
| Tenant API key or CORS mismatch | Browser/contact requests fail after binding | Verify tenant key selector and allowed origins in isolated lane |
| Rollback not rehearsed | Production contact could remain degraded | Prepare rollback settings before production change |

## Open decisions

1. Should the next phase first search for an alternate host type, or proceed directly to a new Pumpkin API App Service exposure plan?
2. Which runtime hosting model is canonical for live Pumpkin API: App Service, Function App, Container App, or Static Web Apps managed API?
3. Should isolated SWA be the first full write-read proof lane, or should a separate non-public API-only test lane be inserted?
4. Who owns protected binding of the tenant API key and provider settings?
5. What is the rollback owner and maximum acceptable rollback time for production contact binding?
