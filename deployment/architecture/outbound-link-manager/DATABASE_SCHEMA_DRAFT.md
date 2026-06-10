# Database Schema Draft

This is a logical schema draft, not a migration. Physical implementation may use Cosmos containers, relational tables, or a hybrid provider model. If Cosmos is used, tenant-scoped containers should partition by `/tenantKey` or the runtime equivalent of `tenant_id`.

## `outbound_links`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable link id. |
| `tenant_id` | string | Required tenant scope. |
| `site_id` | string | Required site scope. |
| `original_url` | string | First observed URL string. |
| `normalized_url` | string | Canonical comparison URL. |
| `domain` | string | Lowercase host without credentials. |
| `status` | enum | Link status. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last update timestamp. |
| `created_by` | string | User or system actor. |
| `disabled_by` | string nullable | Actor that disabled the link. |
| `disabled_at` | datetime nullable | Disable timestamp. |
| `disabled_reason` | string nullable | Operator reason. |

Suggested indexes:

- `(tenant_id, site_id, normalized_url)` unique.
- `(tenant_id, site_id, domain)`.
- `(tenant_id, site_id, status)`.

## `outbound_link_instances`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable instance id. |
| `tenant_id` | string | Required tenant scope. |
| `site_id` | string | Required site scope. |
| `outbound_link_id` | string | Registry foreign key. |
| `page_id` | string nullable | Page or route owner. |
| `content_type` | string | Page, navigation, footer, form, theme, component, import package. |
| `content_block_id` | string nullable | Block/component id. |
| `field_name` | string | Source field. |
| `anchor_text` | string nullable | Display text if available. |
| `location_path` | string | Deterministic JSON/content path. |
| `is_enabled` | boolean | Fast enabled flag for common queries. |
| `status` | enum | Instance status. |
| `first_detected_at` | datetime | First scanner detection. |
| `last_detected_at` | datetime | Last scanner detection. |

Suggested indexes:

- `(tenant_id, site_id, outbound_link_id)`.
- `(tenant_id, site_id, page_id)`.
- `(tenant_id, site_id, status)`.
- `(tenant_id, site_id, location_path)`.

## `outbound_link_audit_logs`

Immutable append-only record.

| Field | Type |
| --- | --- |
| `id` | string |
| `tenant_id` | string |
| `site_id` | string |
| `outbound_link_id` | string nullable |
| `outbound_link_instance_id` | string nullable |
| `action` | string |
| `previous_value` | object nullable |
| `new_value` | object nullable |
| `performed_by` | string |
| `performed_at` | datetime |
| `reason` | string nullable |

## `outbound_link_policies`

One policy per tenant/site.

| Field | Type |
| --- | --- |
| `tenant_id` | string |
| `site_id` | string |
| `default_disabled_behavior` | enum |
| `default_rel` | string array |
| `external_target_behavior` | enum |
| `allowed_domains` | string array |
| `blocked_domains` | string array |
| `review_required_for_new_domains` | boolean |
| `created_at` | datetime |
| `updated_at` | datetime |

## `outbound_link_scan_runs`

| Field | Type |
| --- | --- |
| `id` | string |
| `tenant_id` | string |
| `site_id` | string |
| `status` | enum |
| `started_at` | datetime |
| `completed_at` | datetime nullable |
| `pages_scanned` | integer |
| `links_found` | integer |
| `new_links_found` | integer |
| `stale_instances_found` | integer |
| `errors` | object array |

Scan runs should store summaries and deterministic source references. Large raw content snapshots belong in backup/import artifacts, not audit rows.
