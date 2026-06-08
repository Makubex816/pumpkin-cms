# Normalized Gate Status Vocabulary

Phase 2A should use this controlled vocabulary in reports.

| Status | Meaning | Report behavior |
| --- | --- | --- |
| `not_started` | Gate has not run yet. | neutral |
| `blocked` | Gate cannot proceed because a required prerequisite is missing. | failing exit in strict validation |
| `needs_user_input` | Human input is required to continue. | warning or failing depending on gate |
| `ready_for_review` | Validator completed and is ready for owner/operator review. | non-failing unless strict approval is required |
| `approved` | Human approval is recorded for the gate. | informational; does not itself perform mutation |
| `in_progress` | Gate is actively being worked in a future workflow. | should not appear in offline final report unless imported from a draft state |
| `passed` | Gate checks passed. | success |
| `failed` | Gate checks failed. | failing exit |
| `skipped` | Gate intentionally did not run because it is out of scope. | neutral with explanation |
| `deferred` | Gate is intentionally postponed. | warning unless deferred gate blocks current target |
| `rollback_required` | Gate found a state requiring rollback decision. | failing and escalated |
| `complete` | Gate has been completed and documented. | success/informational |

## Mapping From Existing Schema Terms

Existing `validation-report.schema.json` uses `not-run`, `pass`, `warning`, `fail`, and `blocked`. Phase 2A implementation should either:

1. update the schema in a later approved implementation to this vocabulary, or
2. map internal statuses to the existing schema terms while preserving the normalized vocabulary in Markdown.

This planning package recommends option 1 for Phase 2A implementation planning, but does not modify schema code in this run.

## Exit Code Policy

Recommended future CLI exit codes:

- `0`: all requested gates `passed`, `complete`, `approved`, `ready_for_review`, `skipped`, or `deferred` without blockers
- `1`: one or more gates `failed`, `blocked`, or `rollback_required`
- `2`: validator runtime/configuration error

