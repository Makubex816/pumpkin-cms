# Cosmos Storage Bindings Redacted

## Cosmos

| Account | Resource group | Database count | Key read | Connection string read |
| --- | --- | ---: | --- | --- |
| `cosmos-pumpkin-prod-eastus` | `rg-ice-production-cosmos` | 1 | true | true |
| `cosmos-pumpkincms-stg-olm01` | `rg-pumpkincms-stg-eastus-olm` | 1 | true | true |

Production Cosmos database:

- `pumpkin-prod-cms`

Production containers observed:

- `Tenant`
- `User`
- `Page`
- `Theme`
- `FormDefinition`
- `FormEntry`
- `MediaAsset`
- `ImportRun`
- `PublishRun`
- `DomainBinding`
- legacy/lowercase containers: `tenants`, `users`, `pages`, `themes`, `forms`, `routes`, `sites`, `mediaAssets`, `importRuns`, `publishRuns`

## Storage

| Account | Resource group | Containers read | Key read | Connection string read |
| --- | --- | ---: | --- | --- |
| `iceskatingmedia` | `rg-ice-production-media` | 2 | true | true |
| `iceforms20260605` | `rg-ice-static-form-endpoint` | 4 | true | true |
| `pumpkincmsstgolm01` | `rg-pumpkincms-stg-eastus-olm` | 3 | true | true |

Values are present only in the outside hardcopy.
