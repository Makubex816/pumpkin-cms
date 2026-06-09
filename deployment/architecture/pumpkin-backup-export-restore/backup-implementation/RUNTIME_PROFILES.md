# Runtime Profiles

The Backup Center runtime profile model is a local-first guard layer for provider state decisions.

## Implemented Profiles

| Profile | Purpose | Live Export | Runtime Switch |
| --- | --- | --- | --- |
| `local-dev` | Default local fixture mode | Blocked | Blocked |
| `offline-bundle` | Work from tenant bundles and backup artifacts | Blocked | Blocked |
| `fake-provider` | Fixture-backed proof mode | Blocked | Blocked |
| `local-with-live-readonly` | Local mode prepared for separately approved metadata reads | Blocked | Blocked |
| `live-readonly` | Read-only status model for future approved checks | Blocked | Blocked |
| `runtime-cosmos-future` | Cosmos exists but is not active runtime storage | Blocked | Blocked |
| `production-write-approved` | Future-only hard-stopped profile | Blocked | Blocked |

## Ice Classification

IceSkatingRinkRentals.com resolves to `runtime-cosmos-future` when using the provisioned Cosmos future-target fixture.

That classification means:

- Cosmos infrastructure exists.
- CMS runtime has not switched.
- Ice tenant data has not been seeded or migrated.
- Live database export remains blocked.
- Production restore proof is not complete.

## Source Files

- `src/provider/runtime-profile-model.mjs`
- `src/provider/runtime-profile-writer.mjs`
- `src/provider/runtime-profile-bridge.mjs`
- `fixtures/runtime-profile.*.json`

