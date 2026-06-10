# Audit Logging Model

Outbound Link Manager needs an append-only audit model for link governance.

## Audited Actions

- link discovered;
- link status changed;
- instance status changed;
- policy changed;
- domain allowed;
- domain blocked;
- bulk action previewed;
- bulk action executed;
- scan run started;
- scan run completed;
- stale instance marked;
- restore validation compared outbound link state.

## Audit Entry Fields

- `id`
- `tenant_id`
- `site_id`
- `outbound_link_id`
- `outbound_link_instance_id`
- `action`
- `previous_value`
- `new_value`
- `performed_by`
- `performed_at`
- `reason`

## Redaction Rules

Audit entries may include URLs, domains, statuses, and non-secret actor ids. They must not include tokens, cookies, auth headers, session ids, connection strings, storage keys, SAS values, or protected config values.

## Backup Policy

Standard backups should include either audit summaries or a bounded audit export policy. Full audit export may be large and should be controlled by retention settings.
