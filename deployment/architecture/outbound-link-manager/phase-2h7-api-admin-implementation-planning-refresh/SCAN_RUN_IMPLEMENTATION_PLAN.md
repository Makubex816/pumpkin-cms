# Scan Run Implementation Plan

Scan runs turn content sources into registry, instance, policy, audit, and report updates. In production, scan creation must be explicit, tenant-scoped, and mode-gated.

## Scan Modes

| Mode | Source | Network behavior | Write behavior |
| --- | --- | --- | --- |
| local-fixture | local fixture JSON | none | local `.tmp` only |
| local-store | local file-backed store | none | local `.tmp` only |
| import-package | onboarding package files | none | local or future staged provider |
| tenant-bundle | tenant website bundle files | none | local or future staged provider |
| backup-bundle | Backup Center candidate files | none | local validation only |
| live-readonly | approved CMS/API read endpoints | approved read-only only | no mutation |
| live-write-approved | future explicit approval | approved source only | gated provider writes |

## Pipeline

1. Validate tenant/site scope and scan mode.
2. Validate source path or provider access.
3. Extract outbound URLs from approved fields.
4. Normalize URLs and domains.
5. Build registry records and instance records.
6. Merge with previous state.
7. Mark missing prior instances stale.
8. Apply policies.
9. Create scan-run summary and audit entries.
10. Write reports to approved target.

## Hard Stops

- No external URL crawling.
- No live HTTP checks of outbound destinations.
- No protected config reads.
- No source outside the approved scan mode.
- No live writes without a later explicit phase approval.

