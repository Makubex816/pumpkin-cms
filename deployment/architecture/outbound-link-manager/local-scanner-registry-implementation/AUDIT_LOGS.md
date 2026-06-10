# Audit Logs

Audit logs are local append-only records in `outbound-link-audit-logs.json`.

Current local actions:

- `scan_merged`
- `link_status_changed`
- `instance_status_changed`
- `policy_set`

Audit records include:

- `tenant_id`
- `site_id`
- action
- record type
- record id
- local actor
- reason
- timestamp
- before and after summary

Audit logs are fixture/local evidence only. They are not written to CMS, API, Azure, or a database in this phase.
