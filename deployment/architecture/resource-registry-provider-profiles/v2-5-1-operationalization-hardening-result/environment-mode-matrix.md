# Environment Mode Matrix

| Mode | State | Write posture | Operational use |
| --- | --- | --- | --- |
| `local-dev` | allowed | no provider writes | local docs, fixtures, validators |
| `fake-provider` | allowed | no provider writes | local fake responses and guard checks |
| `offline-bundle` | allowed | no provider writes | Backup Center and tenant bundle review |
| `local-file-backed` | allowed | no provider writes | local OLM file-backed store |
| `local-api-fake-provider` | allowed | no provider writes | Admin/API read-only and write guard QA |
| `staging-simulated` | allowed | ignored `.tmp` only | apply/replay/readback simulation |
| `live-readonly` | allowed only with explicit profile | read-only only | safe metadata/readback checks |
| `live-write-approved` | scoped-only | no new writes in V2.5.1 | previously approved first OLM staging batch only |
| `production-runtime` | blocked | no production writes | future production approval required |

All modes explicitly block protected config reads, Azure mutations, deployment, indexing, and live publication in V2.5.1.

