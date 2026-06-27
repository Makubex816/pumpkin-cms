# Resource Registry Provider Profile Gap List

## Carryforward source

V2.5 and 2F-12N Resource Registry work established a redacted metadata model for Azure resources and provider profiles. The registry profile identified production Cosmos as a future target and recorded that runtime wiring remained required.

## Current confirmed metadata

- Production Cosmos account: `cosmos-pumpkin-prod-eastus`.
- Resource group: `rg-ice-production-cosmos`.
- Database: `pumpkin-prod-cms`.
- Containers: `forms`, `importRuns`, `routes`, `mediaAssets`, `users`, `themes`, `pages`, `sites`, `tenants`, `publishRuns`.
- Static Web App production resource: `swa-ice-static-staging`.
- Legacy/static contact Function App: `func-ice-static-contact-20260605`.

## Gaps

| Gap | Why it matters | Next action |
| --- | --- | --- |
| No live Pumpkin API host visible | Static contact has no verified API target | Verify alternate host type or create/expose runtime |
| Provider profile not proven on live API | Cosmos can exist without API using it | After API host exists, run approved non-secret provider metadata check |
| Production API provider binding protected | Connection details and credentials are secret/protected | Bind through approved secret-safe flow |
| Tenant CORS/origin profile unverified | Browser Admin/static flows can fail even if API exists | Verify tenant origins after API provider is available |
| Registry runtime status still future-target | Registry inventory is not equivalent to live wiring | Update registry after runtime proof |
| Candidate publish-profile URL unverified | Could be stale, deleted, or outside current inventory | Do not use until current Azure metadata resolves it |

## Provider profile conclusion

Production Cosmos is present, but Pumpkin API runtime binding to that Cosmos provider is not proven. The provider profile should remain `future-target` or `runtime-wiring-required` until the API host and non-secret provider metadata agree.
