# Instance Tracking Result

The instance tracker creates one `outbound_link_instances` record per placement.

Implemented fields:

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

Verified behavior:

- same URL in multiple fields creates multiple instances;
- same URL across multiple pages creates multiple page-scoped instances;
- prior disabled instance state is preserved;
- missing prior instance becomes `stale`;
- every instance references an existing registry link.
