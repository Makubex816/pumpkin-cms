# Future Import Audit Trace Plan

Status: created.

Ice trace:

- `audit-trace-ice-rink-rentals-carryforward-v2-11-2-v2-11-6`.

Roller trace:

- `audit-trace-roller-rink-rentals-paused-preview-v2-11-2-v2-11-6`.

Future trace must bind:

- Approval manifest ID.
- Package hash.
- Dry-run ID.
- No-go result.
- Prerequisite results.
- Execution approval state.
- Write attempt count.
- Readback result.
- Rollback/abort decision.

V2.11.6 created trace IDs only; it did not write audit jobs.

