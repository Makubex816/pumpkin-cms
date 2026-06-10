# Remaining Gates

Status: explicit

Backup Center gates:

| Gate | Status | Required approval |
| --- | --- | --- |
| Owner standard backup proof signoff | pending | Owner acceptance of 12T package. |
| Retention and cleanup decision | pending | Owner decision on `.tmp` proof and encrypted handoff handling. |
| Production credential escrow policy | pending | Owner/security approval. |
| Live restore rehearsal | blocked | Separate restore approval and target sandbox. |
| CMS runtime switch to Cosmos | blocked | Separate runtime switch plan and rollback approval. |
| CMS writes and MediaAsset writes | blocked | Separate CMS write approval. |

Product/platform gates:

| Gate | Status | Required approval |
| --- | --- | --- |
| Admin UI implementation | paused | Separate Admin implementation approval. |
| Electron desktop app | paused | Separate Electron design/build approval. |
| Outbound Link Manager architecture | ready next | Separate architecture approval. |
| Outbound Link Manager implementation | not approved | Separate implementation approval after architecture. |
| Roller CMS reconciliation writes/imports | paused | Separate Roller write/import approval. |

Launch gates:

| Gate | Status |
| --- | --- |
| Deployment | blocked |
| Cloudflare/DNS mutations | blocked |
| Function App setting changes | blocked |
| Search Console/indexing | blocked |
| Live-page publication | blocked |

No gate above was opened by Phase 2F-12T.
