# Instance Tracking Output

Scanner output includes `outbound-link-instances.json`:

```json
{
  "schemaVersion": "0.1.0",
  "tenant_id": "fixture-tenant",
  "site_id": "fixture-site",
  "outbound_link_instances": []
}
```

Each instance record contains:

- `id`
- `tenant_id`
- `site_id`
- `outbound_link_id`
- `page_id`
- `content_type`
- `content_block_id`
- `field_name`
- `anchor_text`
- `location_path`
- `is_enabled`
- `status`
- `first_detected_at`
- `last_detected_at`

Each placement creates one instance. The same URL across multiple fields or pages creates one registry record and multiple instances.

Prior disabled instance state is preserved when the same `location_path` is detected again. Missing prior instances become `stale`.
