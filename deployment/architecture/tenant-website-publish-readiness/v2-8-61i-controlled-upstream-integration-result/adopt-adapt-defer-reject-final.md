# Adopt Adapt Defer Reject Final

| Decision | Item | Result |
| --- | --- | --- |
| Adopt | `apps/starter-app` | Imported as additive local source baseline. |
| Adopt | upstream starter app docs/content/theme | Imported with starter app. |
| Adapt | starter embedded `/admin` | Isolated as starter-template admin; not production Admin UI replacement. |
| Adapt | starter FormDefinition editor | Emits active required FormDefinition metadata. |
| Adapt | starter form definitions response parsing | Supports both `definitions` and `formDefinitions`. |
| Adapt | package form field types/options | Supports upstream option object shape and active string option shape. |
| Preserve | active Pumpkin API forms routes | No C# API source change; source tests passed. |
| Preserve | DomainBinding/backup/intake/operator systems | No source removal; preservation tests passed. |
| Defer | `apps/sample-app-2` | Future template/sample lane. |
| Defer | starter app type-check/build | Requires dependency install or prepared node_modules; not approved here. |
| Defer | starter deploy/runtime proof | Requires later isolated proof approval. |
| Defer | customer-facing form POST proof | Requires later explicit approval. |
| Reject | blind merge | Not performed. |
| Reject | replacing standalone Admin UI | Not performed. |
| Reject | Airstrip as sandbox | Not used. |
