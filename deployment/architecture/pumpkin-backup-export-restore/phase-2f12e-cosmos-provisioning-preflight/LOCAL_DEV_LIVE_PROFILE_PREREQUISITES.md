# Local-Dev And Live Profile Prerequisites

## Profiles

| Profile | Purpose | Requirements |
| --- | --- | --- |
| `fixture` | Test provider resolver and Backup Center contracts | local fixtures only |
| `local-dev` | Developer workflow without live Azure | local provider or fixture data |
| `local-cosmos-emulator` | Optional future local Cosmos-like testing | local emulator only if approved |
| `production-readonly` | Live provider verification without export | metadata endpoint and read-only Azure/Cosmos access |
| `production-export-approved` | Later Cosmos export execution | explicit export approval and tenant/site scope |

## Wiring Prerequisites

- provider resolver supports profile field in output;
- CMS runtime can expose non-secret provider metadata;
- local-dev continues without protected config reads;
- live profiles fail closed if tenant/site scope is missing;
- export profile cannot run before provider resolver and metadata endpoint readiness pass.

## Local-Dev Rule

Local-dev provider output is never production restore proof.
