# Phase-name simplification and legacy crosswalk

CUR-20 preserves the readable Atlas milestone style and rejects a competing OPS-010 registry.

Required identity/capacity milestone model retained for future Atlas reconciliation:

| Milestone ID | Title | Status in CUR-20 |
| --- | --- | --- |
| `IDM-10` | Universal Identity Foundation | planned crosswalk target |
| `IDM-20` | Production Identity Backfill and Compatibility | planned crosswalk target |
| `IDM-30` | Identity Management Production Activation | completed downstream milestone represented by CRSTUR |
| `IDM-40` | Mutable Tenant Slug Activation | retained downstream continuation, not started |
| `IDM-50` | Identity and Tenant Administration Final Closeout | future downstream closeout |
| `PERF-10` | S2 Capacity Observation and Optimization Decision | parallel operational milestone |
| `CUR-20` | Current Build Closeout Ingestion | current handoff milestone, blocked on active Atlas |
| `UP-20` | Recheck and Freeze Exact Upstream Source | next upstream milestone after successful CUR-20 |

Attempt IDs must remain separate from milestones. Example retained:

- Milestone: `IDM-30`
- Attempt: `IDM-30-A01`, legacy `V2.8.63C`
- Recovery attempt: `IDM-30-A02`, legacy `V2.8.63CR`

## Discovery counts

Preliminary repository/package scans found:

- 256 unique `V2.8.*` identifiers in the repository/docs scan, excluding `.tmp`, build output, node_modules, bin/obj, and test-results.
- 53 unique `V2.8.*` identifiers in the supplied Atlas/working-memory input packages.

Because the active Build Atlas was not located, CUR-20 did not finalize a one-to-one legacy crosswalk and did not claim crosswalk uniqueness. Final crosswalk work must occur inside the active Atlas after its schema, IDs, history, and update behavior are known.

## High-level grouping to preserve

- Party Pros: `TEN-PPH-10` through `TEN-PPH-40`
- Vegas: `TEN-VEG-10` through `TEN-VEG-50`
- Universal forms: `FORM-20`
- Identity: `IDM-10` through `IDM-50`
- Capacity: `PERF-10`

No historical V2.8 identifier was renamed, moved, or deleted in CUR-20.

