# Runtime Profile Support Plan

## Profiles

| Profile | Purpose | External access |
| --- | --- | --- |
| `fixture` | Test resolver and Backup Center contracts. | None |
| `local-dev` | Developer workflow using fake/local data. | None |
| `local-cosmos-emulator` | Optional future local Cosmos-like testing. | Local only |
| `local-with-live-readonly` | Operator preflight that may combine local package state with approved read-only metadata. | Read-only only |
| `production-readonly` | Live verification without export or mutation. | Read-only only |
| `production-export-approved` | Later Cosmos export execution after explicit approval. | Export only, no mutation |

## Profile Rules

- Default profile is not allowed for live operations.
- Export-capable profile requires tenant/site scope and explicit approval.
- Provisioning is not part of any Backup Center export profile.
- Local-dev cannot be used as production restore proof.
- Live profiles must reject protected config reads and secret values.

## Current Requirement

The next implementation should support fixture and local-dev profiles first. Live profiles should be represented in schema and docs, then activated only in later approved phases.
