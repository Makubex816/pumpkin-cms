# Schema Contract Plan

Production schema contracts must be versioned and provider-neutral.

Common fields for all entities:

- `id`
- `tenantKey`
- `siteKey`
- `entityType`
- `schemaVersion`
- `recordVersion`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`
- `sourceProvider`
- `migrationBatchId`
- `traceId`

Entity-specific contracts:

- `outbound_links`: URL, domain, normalized URL, lifecycle status, severity, policy status, disabled context, instance counters
- `outbound_link_instances`: link ID, page ID, content type, content block ID, field name, location path, anchor text, instance status, render action
- `outbound_link_policies`: allowed domains, blocked domains, pending review domains, default behavior, rel/target rules, policy version
- `outbound_link_scan_runs`: mode, status, started/completed timestamps, page/link/new/stale counts
- `outbound_link_audit_logs`: action, record type, record ID, actor fields, reason, mode, trace reference
- `outbound_link_render_decisions`: page ID, instance ID, link ID, render action, safe rel, safe target, reason code
- `outbound_link_review_decisions`: decision, domain/link/instance target, actor, reason, approval reference
- `outbound_link_bulk_actions`: action, domain/page scope, affected IDs, approval reference, summary
- `outbound_link_rollback_plans`: rollback ID, action, before/after hashes, changes, executable flag
- `outbound_link_trace_logs`: required trace fields, boundaries, outcome, block reason

Schema contracts should be added as local JSON Schemas or typed DTO snapshots in a future dry-run phase. They must reject missing tenant/site fields, cross-tenant references, and secret-like values.
