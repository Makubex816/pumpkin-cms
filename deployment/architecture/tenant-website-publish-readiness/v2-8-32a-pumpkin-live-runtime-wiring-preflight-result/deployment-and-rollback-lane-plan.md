# Deployment And Rollback Lane Plan

## Current lane

V2.8.32A is preflight only. No deployment or runtime mutation was performed.

## Recommended future lanes

| Lane | Goal | Entry criteria | Rollback |
| --- | --- | --- | --- |
| 1. API resource discovery | Find whether Pumpkin API already exists under another host type | Metadata-only approval | No rollback needed; read-only |
| 2. API exposure or deployment | Create/expose live Pumpkin API if missing | Explicit deployment approval, Backup Center readiness | Remove or disable newly exposed host; retain previous public contact mode |
| 3. API provider binding | Bind API to production Cosmos provider | Protected secret-safe approval | Restore previous API provider settings or disable host |
| 4. Admin binding | Point Admin to verified API base URL | API provider metadata passes | Revert Admin base URL to previous value |
| 5. Isolated static contact binding | Point isolated SWA managed API to Pumpkin API mode | Admin read-only path passes | Revert static contact mode to previous non-persistence mode |
| 6. Isolated runtime QA | Prove write-read path with a controlled test | Isolated binding complete | Remove/reclassify test entry per policy if approved |
| 7. Production binding | Bind production static contact after isolated proof | Separate production approval | Revert contact mode/base URL/key selector to previous values |

## Rollback principle

Rollback should prefer restoring the prior contact delivery mode and API base URL binding before any DNS or domain action. DNS changes are not needed for the contact persistence fix and should remain out of scope unless a later phase explicitly requires them.
