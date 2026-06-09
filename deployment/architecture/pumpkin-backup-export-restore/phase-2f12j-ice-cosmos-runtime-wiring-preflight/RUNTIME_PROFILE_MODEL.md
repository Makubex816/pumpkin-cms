# Runtime Profile Model

The runtime profile model separates local development, read-only metadata verification, future provider wiring, and production write behavior. A provisioned Cosmos account does not automatically become the active CMS runtime source.

## Profiles

| Profile | Purpose | External Access | Data Writes | Runtime Switch |
| --- | --- | --- | --- | --- |
| `local-dev` | Use local/fake providers for development and tests | None | No | No |
| `fake-provider` | Exercise Backup Center fixtures and provider resolver behavior | None | No | No |
| `live-readonly` | Verify non-secret provider metadata from the approved endpoint | GET only in a later approved execution | No | No |
| `runtime-cosmos-future` | Prepare disabled runtime Cosmos wiring for Ice | None during this phase | No | No |
| `production-write-approved` | Future production runtime profile after explicit approvals | Separately approved | Separately approved | Separately approved |

## Profile State Fields

Each profile should expose these non-secret state fields:

- `profileName`
- `tenantKey`
- `siteKey`
- `environment`
- `providerType`
- `providerRole`
- `provisioningStatus`
- `runtimeStatus`
- `metadataSource`
- `liveExportAllowed`
- `runtimeSwitchAllowed`
- `dataSeedAllowed`
- `secretMaterialIncluded`

## Required Ice State

For Ice after Phase 2F-12J:

- `providerType`: `cosmos`
- `providerRole`: `future-target`
- `provisioningStatus`: `provisioned`
- `runtimeStatus`: `runtime-wiring-preflight-complete`
- `metadataSource`: `local-and-endpoint-foundation`
- `liveExportAllowed`: `false`
- `runtimeSwitchAllowed`: `false`
- `dataSeedAllowed`: `false`
- `secretMaterialIncluded`: `false`

## Guardrail

Runtime selection must require both a configured profile and an approval state. It must not infer that Cosmos is active merely because a resource group, account, database, or container exists.

