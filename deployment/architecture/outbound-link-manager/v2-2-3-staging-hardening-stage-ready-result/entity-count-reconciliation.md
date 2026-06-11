# Entity Count Reconciliation

Status: passed.

| Entity | Expected | Read back |
| --- | ---: | ---: |
| `outbound_links` | 5 | 5 |
| `outbound_link_instances` | 5 | 5 |
| `outbound_link_policies` | 2 | 2 |
| `outbound_link_scan_runs` | 1 | 1 |
| `outbound_link_audit_logs` | 2 | 2 |
| `outbound_link_render_decisions` | 5 | 5 |
| `outbound_link_review_decisions` | 1 | 1 |
| `outbound_link_bulk_actions` | 2 | 2 |
| `outbound_link_rollback_plans` | 1 | 1 |
| `outbound_link_trace_logs` | 24 | 24 |

Verified scope fields:

- approval manifest
- first-write batch
- provider profile
- provider mode
- tenant/site scope
- target container mapping
- target record IDs
- rollback plan ID
- before/after state hashes

Trace continuity is represented by request/action/correlation IDs in the migrated records.

