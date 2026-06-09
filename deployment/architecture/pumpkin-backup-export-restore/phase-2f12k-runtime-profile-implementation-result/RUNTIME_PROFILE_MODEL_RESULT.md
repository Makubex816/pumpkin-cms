# Runtime Profile Model Result

## Implemented Profiles

| Profile | Status | Live Export | Runtime Switch |
| --- | --- | --- | --- |
| `local-dev` | Implemented | Blocked | Blocked |
| `offline-bundle` | Implemented | Blocked | Blocked |
| `fake-provider` | Implemented | Blocked | Blocked |
| `local-with-live-readonly` | Implemented as status model | Blocked | Blocked |
| `live-readonly` | Implemented as status model | Blocked | Blocked |
| `runtime-cosmos-future` | Implemented | Blocked | Blocked |
| `production-write-approved` | Implemented as hard-stopped future profile | Blocked | Blocked |

## Guard Decisions

The model produces separate guard results for:

- Live database export
- Fake complete export
- CMS runtime switch
- Production writes

## Ice Classification

Ice resolves to `runtime-cosmos-future` when using the provisioned future-target Cosmos fixture. This keeps the provisioned Cosmos account visible without treating it as active runtime storage.

