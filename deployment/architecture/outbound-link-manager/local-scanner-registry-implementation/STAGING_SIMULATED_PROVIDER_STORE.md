# Staging-Simulated Provider Store

The staging-simulated provider store is a file-backed local store under ignored `.tmp` output.

It stores one JSON collection per target entity:

- `outbound_links`
- `outbound_link_instances`
- `outbound_link_policies`
- `outbound_link_scan_runs`
- `outbound_link_audit_logs`
- `outbound_link_render_decisions`
- `outbound_link_review_decisions`
- `outbound_link_bulk_actions`
- `outbound_link_rollback_plans`
- `outbound_link_trace_logs`

Every stored record preserves tenant/site scope, `/tenantKey` partitioning, provider profile ID, apply-plan ID, execution IDs, readback IDs, state hashes, rollback ID, audit IDs, and affected entity IDs.

The store is local evidence only. It is not a Cosmos account, SQL database, CMS table, or production provider.

