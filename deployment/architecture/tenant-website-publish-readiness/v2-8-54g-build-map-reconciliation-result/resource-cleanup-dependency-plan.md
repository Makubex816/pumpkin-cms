# Resource Cleanup Dependency Plan

Source: V2.8.54F resource rationalization.

Do-not-delete remains active for:

- Production Pumpkin API/Admin/SWA/Cosmos/media/API plan resources.
- Isolated Admin UI and isolated SWA.
- Observability workspace, action group, and alerts.
- Legacy static form resources until decommission proof.

Cleanup candidates:

- `log-pumpkincms-stg-olm01`
- `cosmos-pumpkincms-stg-olm01`
- `pumpkincmsstgolm01`
- `id-pumpkincms-olm-stg`
- `appi-pumpkincms-stg-olm01`
- `kv-pumpkincms-stg-olm01`
- `Application Insights Smart Detection`

Future dependency proof must check:

- Source references and deployment scripts.
- Appsettings presence by name only, not value.
- Diagnostic settings and alert references.
- RBAC assignments and managed identity bindings.
- Storage/blob/container usage and recent traffic.
- Cosmos account/database/container usage.
- Log Analytics ingestion or query dependency.

No deletion occurred in V2.8.54G.

