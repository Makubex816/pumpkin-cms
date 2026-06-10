# Registry Builder Result

The registry builder creates one `outbound_links` record per normalized URL within a tenant/site.

Implemented fields:

- `id`
- `tenant_id`
- `site_id`
- `original_url`
- `normalized_url`
- `domain`
- `status`
- `created_at`
- `updated_at`
- `created_by`
- `disabled_by`
- `disabled_at`
- `disabled_reason`

Implemented status behavior:

- allowed domains become `active`;
- unreviewed domains become `pending_review`;
- blocked domains become `domain_blocked`;
- prior disabled links remain `disabled`;
- missing prior links become `stale`.

Duplicate URL behavior was verified: repeated placements of the same normalized URL create one registry record.
