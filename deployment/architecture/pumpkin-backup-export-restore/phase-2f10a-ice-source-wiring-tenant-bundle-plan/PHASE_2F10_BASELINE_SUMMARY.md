# Phase 2F-10 Baseline Summary

Phase 2F-10 created a complete Ice standard backup candidate under ignored `.tmp` output and reran validation.

## Included

| Component | Status |
| --- | --- |
| CMS content | Included |
| Static evidence | Included |
| Redacted config inventory | Included |
| Media metadata inventory | Included |
| Escrow marker | `ESCROW_NOT_INCLUDED.md` only |
| Backup validator | Passed |
| Restore-plan dry-run | Passed for available inventory |

## Counts

| Inventory | Count |
| --- | ---: |
| Tenants | 1 |
| Sites | 1 |
| Pages | 3 |
| Routes | 5 |
| Forms | 3 |
| SEO entries | 3 |
| Redirects | 0 |
| Theme settings | 1 |
| Media assets | 12 |
| Static evidence routes | 5 |
| Config variables | 11 |

## Blocked

| Component | Status | Reason |
| --- | --- | --- |
| Database export artifact | Blocked | DB env/tooling readiness missing; `sqlpackage` missing; Azure SQL/storage env missing |
| Database platform evidence | Blocked | Azure resource identifiers missing in Phase 2F-10 |
| Media blob copies | Blocked | Media storage/copy env readiness missing |
| Production restore proof | Blocked | Database and media binary proof missing |

Phase 2F-10A turns these blockers into a source wiring and connector architecture plan.

