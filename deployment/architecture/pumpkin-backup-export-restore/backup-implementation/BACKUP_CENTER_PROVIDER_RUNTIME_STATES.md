# Backup Center Provider Runtime States

## States

| Provider status | Source resolution | Runtime status | Export state |
| --- | --- | --- | --- |
| `missing` | `unresolved` | `provider-source-missing` | blocked |
| `future-target` | `planned` | `not-runtime-configured` | blocked |
| `future-target` | `provisioned` | `metadata-endpoint-runtime-wiring-required` | blocked |
| `configured` | `resolved` | future runtime configured state | blocked until separately approved |

## Ice Current State

Ice is:

- `providerType`: `cosmos`
- `providerStatus`: `future-target`
- `sourceResolutionStatus`: `provisioned`
- `runtimeStatus`: `metadata-endpoint-runtime-wiring-required`

This means the Cosmos shell exists, but Pumpkin CMS runtime wiring, data seed/migration, and live database export are not approved or complete.

