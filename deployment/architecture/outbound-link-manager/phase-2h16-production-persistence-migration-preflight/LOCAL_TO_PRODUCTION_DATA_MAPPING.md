# Local To Production Data Mapping

The local store uses JSON files and snake_case fields. Production records should use stable entity IDs, tenant/site scope, camelCase API DTOs, and provider-native indexing.

Mapping principles:

- `tenant_id` -> `tenantKey`
- `site_id` -> `siteKey`
- local `id` -> production `id`
- `normalized_url` -> `normalizedUrl`
- `original_url` -> `originalUrl`
- `created_at` and `updated_at` -> `createdAt` and `updatedAt`
- disabled fields remain nullable and audit-backed
- status values must remain compatible with Admin/API DTOs
- every production record must include `tenantKey`, `siteKey`, `entityType`, `schemaVersion`, and `recordVersion`

Entity mappings:

- `outbound-links.json` -> `outbound_links`
- `outbound-link-instances.json` -> `outbound_link_instances`
- `outbound-link-policies.json` -> `outbound_link_policies`
- `outbound-link-scan-runs.json` -> `outbound_link_scan_runs`
- `outbound-link-audit-logs.json` -> `outbound_link_audit_logs`
- render output -> `outbound_link_render_decisions`
- review/write responses -> `outbound_link_review_decisions`
- bulk preflight output -> `outbound_link_bulk_actions`
- rollback plans -> `outbound_link_rollback_plans`
- trace logs -> `outbound_link_trace_logs`

Dry-run mapping must write deterministic JSON first, then validators compare local counts, IDs, tenant/site fields, and referential integrity before any live write is considered.
