# Incomplete Or Blocked Components

Date: 2026-06-09

| Component | Status | Blocking Reason | Next Required Approval |
| --- | --- | --- | --- |
| Database export artifact | Blocked | DB env/tooling readiness missing; `sqlpackage` missing; Azure SQL/storage env missing | Provide approved DB export mode/env/tooling and permit the selected read/export path |
| Database platform evidence | Blocked | Azure resource identifiers missing; no Azure command run | Provide approved Azure evidence mode/env and read-only evidence boundary |
| Media blob copies | Blocked | Media storage/copy env readiness missing | Provide approved media copy mode/env/tooling |
| Media binary recoverability | Not proven | Metadata inventory only | Run approved media copy/download or private backup storage evidence |
| Production restore proof | Blocked | Database and media binary proof missing | Rerun validator/restore plan after DB/media artifacts are present |

Not blocked:

- CMS content export completed.
- Static evidence completed.
- Redacted config inventory completed.
- Escrow exclusion completed.
- Complete candidate bundle was created under ignored output.
- Validator passed.
- Restore-plan dry-run passed for available inventory.

