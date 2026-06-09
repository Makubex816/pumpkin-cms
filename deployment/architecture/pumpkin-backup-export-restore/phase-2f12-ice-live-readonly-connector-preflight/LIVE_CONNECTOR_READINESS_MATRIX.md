# Live Connector Readiness Matrix

| Area | Status | Evidence |
| --- | --- | --- |
| Cosmos account discovery | BLOCKED | No Cosmos DB accounts returned in active subscription. |
| Cosmos database/container discovery | BLOCKED | No candidate account/resource group available. |
| Cosmos platform backup evidence | BLOCKED | No candidate account available for backup-policy metadata. |
| Portable Cosmos JSON export readiness | BLOCKED | Missing provider/account env hints and no visible account; export not approved in this phase. |
| Media account discovery | READY | `iceskatingmedia` found in `rg-ice-production-media`. |
| Media container discovery | READY | `ice-rink-rentals-media` container metadata read with login/RBAC. |
| Media blob metadata listing | READY | 9 blob metadata entries listed with login/RBAC and no downloads. |
| Media blob full-copy readiness | APPROVAL_NEEDED | Metadata access works, but blob download/copy was not approved in this phase. |
| Tenant bundle integration readiness | READY_LOCAL | Phase 2F-11 fake tenant bundle integration passes regression. |
| Standard backup production restore proof | BLOCKED | Cosmos source and real media copy/evidence remain incomplete. |

## Overall

No-go for live connector execution approval today. Go for a targeted follow-up to resolve the Cosmos/provider source scope and prepare a media copy/download approval boundary.
