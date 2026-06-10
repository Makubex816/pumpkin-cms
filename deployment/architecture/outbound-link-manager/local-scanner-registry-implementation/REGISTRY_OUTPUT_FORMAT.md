# Registry Output Format

Scanner output includes `outbound-links.json`:

```json
{
  "schemaVersion": "0.1.0",
  "tenant_id": "fixture-tenant",
  "site_id": "fixture-site",
  "outbound_links": []
}
```

Each outbound link record contains:

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

The same normalized URL in one tenant/site creates one registry record.

Status values used by this phase:

- `active`
- `disabled`
- `pending_review`
- `domain_blocked`
- `stale`
- `archived`
