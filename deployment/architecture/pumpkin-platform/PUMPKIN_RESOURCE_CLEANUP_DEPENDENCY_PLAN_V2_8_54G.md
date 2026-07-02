# Pumpkin Resource Cleanup Dependency Plan V2.8.54G

Status: cleanup_plan_only_no_deletion

V2.8.54F cleanup candidates remain candidates only:

- `log-pumpkincms-stg-olm01`
- `cosmos-pumpkincms-stg-olm01`
- `pumpkincmsstgolm01`
- `id-pumpkincms-olm-stg`
- `appi-pumpkincms-stg-olm01`
- `kv-pumpkincms-stg-olm01`
- `Application Insights Smart Detection`

Dependency proof required before any decommission:

- Source/config references.
- Appsetting name presence without values.
- Runtime traffic and logs.
- RBAC and managed identity bindings.
- Storage, Cosmos, diagnostics, and alert dependencies.
- Rollback or recovery plan.

Legacy static form resources also remain protected until their traffic, source, config, and storage dependencies are closed.

