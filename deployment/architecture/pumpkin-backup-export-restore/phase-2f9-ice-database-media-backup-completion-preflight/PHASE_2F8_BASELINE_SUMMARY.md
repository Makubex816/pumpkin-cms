# Phase 2F-8 Baseline Summary

Phase 2F-8 created the first real Ice standard backup baseline under ignored `.tmp` output.

## Included

| Component | Result |
| --- | --- |
| CMS read-only export | Included |
| Tenant records | 1 |
| Site records | 1 |
| Page records | 3 |
| Route records | 5 |
| Form records | 3 |
| SEO records | 3 |
| Redirect records | 0 |
| Theme records | 1 |
| MediaAsset metadata records | 12 |
| Static evidence routes | 5 |
| Redacted config variables | 11 |
| Backup validator | Passed |
| Restore-plan dry-run | Passed for available inventory |

## Missing

| Component | Status | Impact |
| --- | --- | --- |
| Database export artifact | Not included | Full production restore proof blocked |
| Media blob copies | Not included | Media binary recoverability not proven |
| Encrypted escrow | Not included | Correct for standard backup mode |

## Phase 2F-9 Purpose

Phase 2F-9 converts the missing database and media components into a controlled execution plan for a later approval decision. It does not execute the plan.

