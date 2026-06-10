# Guarded Seed Retry Result

Status: seeded and verified

Command:

```powershell
node src/backup-cli.mjs cosmos-seed:live-execute --seed .tmp/phase-2f12o-ice-cosmos-seed-dry-run --out .tmp/phase-2f12q-rbac-seed-retry --overwrite
```

Execution summary:

| Container | Created | Skipped matching existing | Expected |
| --- | ---: | ---: | ---: |
| tenants | 0 | 1 | 1 |
| sites | 0 | 1 | 1 |
| pages | 1 | 2 | 3 |
| routes | 5 | 0 | 5 |
| forms | 3 | 0 | 3 |
| mediaAssets | 12 | 0 | 12 |
| themes | 1 | 0 | 1 |
| publishRuns | 0 | 0 | 0 |
| importRuns | 1 | 0 | 1 |
| users | 0 | 0 | 0 |
| total | 23 | 4 | 27 |

The first post-RBAC run encountered Cosmos 429 throttling after four deterministic matching documents had landed. The runner was hardened with retry-after handling and partial-count recording, then rerun idempotently. The final retry skipped those four matching documents, created the remaining 23, and completed readback.

No conflicts were detected.
