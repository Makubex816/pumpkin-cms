# Endpoint To Panel Implementation Result

Endpoint-to-panel mapping implemented:

| Endpoint | Admin panel/data |
| --- | --- |
| `/viewer-summary` | Release Summary, panel metadata, warnings, blockers, next gates |
| `/events` | Audit Events and operational coverage records |
| `/job-runs` | Job Runs |
| `/promotion-gates` | Promotion Gates |
| `/evidence-bindings` | Evidence Bindings |
| `/traces` | Trace Explorer |
| `/blockers` | Blockers context |
| `/next-gates` | Next Gates and disabled future-action context |

The Admin UI still renders through the existing panel grid, summary strip, operational coverage, ledger table, and detail panel.
