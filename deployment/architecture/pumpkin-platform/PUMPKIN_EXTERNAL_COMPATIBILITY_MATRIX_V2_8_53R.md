# Pumpkin External Compatibility Matrix V2.8.53R

## Summary

Classification: `current_build_additive_with_route_alias_and_hardcode_remediation_required`

| Area | External Contract | Current Build | Compatibility |
| --- | --- | --- | --- |
| Runtime | `global.json` SDK 10.0.100, API `net10.0` | SDK 10.0.100 with roll-forward, API `net10.0` | Compatible. |
| API package refs | JWT bearer, Cosmos SDK, BCrypt, Newtonsoft, Swagger | Same, plus publish excludes appsettings when configured | Compatible/additive. |
| Database settings | `Database` provider with `CosmosDb`/`MongoDb` sections | Same | Compatible. |
| Cosmos containers | `Tenant`, `Page`, `User`, `Theme`, `FormEntry` | Same plus `FormDefinition`, `MediaAsset`, `PublishRun`, `ImportRun` | Additive, but future-target provider metadata naming must be reconciled. |
| Public page route | `/api/pages/{tenantId}/{pageSlug}` | Present | Compatible. |
| Public form entry route | `/api/forms/{tenantId}/entries` | Present | Compatible, but payload adapter must be verified. |
| Public form submit route | `/api/forms/{tenantId}/submit/{type}` | Missing | P0 route alias/adapter needed. |
| Public theme route | `/api/themes/{tenantId}` and detail | Present | Compatible. |
| Auth login | `/api/auth/login` | Present plus verify/logout | Compatible/additive. |
| Admin FormEntry routes | `/api/admin/forms/{tenantId}/entries` | Replaced by `/api/admin/{tenantId}/form-entries` | P0 alias needed. |
| Models | Tenant/Page/User/Theme/FormDefinition/FormEntry | Extended Page/Form/FormEntry/Theme plus media/import/publish | Compatible if extra fields remain optional and old payloads parse. |
| Static contact | External contact prompt targets form API | Current production uses managed static contact API | Adapter strategy required; do not remove static contact path. |
| Tenant expansion | External is tenantId-based | Current build has Ice/Roller hard-coded publish/static hooks | P0 data-driven tenant profile work needed before secondary creation. |

## Decision

External compatibility must gate secondary tenant creation. Route aliases and hard-coded tenant profile remediation are required before creation resumes.
