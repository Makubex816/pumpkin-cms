# Job Run View Model

Job run rows are derived from `ledger.jobRuns`.

## Fields

- `id`
- `type`
- `status`
- `outcome`
- `startedAt`
- `completedAt`
- `auditEventIds`
- `evidenceRefs`
- `evidenceCount`
- `evidenceSummaries`
- `readOnlySafety`

## Purpose

The job run panel shows each recorded job, its validation outcome, linked audit events, linked evidence, and compact no-write safety state.

## Combined Fixture

The combined fixture exposes 9 job runs, all as read-only detail rows.
