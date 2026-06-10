# Status Lifecycle

Allowed link statuses:

- `active`
- `disabled`
- `pending_review`
- `domain_blocked`
- `stale`
- `broken_unverified`
- `archived`

Allowed instance statuses:

- `enabled`
- `disabled`
- `hidden`
- `plain_text`
- `fallback`
- `pending_review`
- `stale`

Global link status and per-instance status are distinct. A global link can be disabled without deleting the placement records, and a single instance can be rendered as plain text while the global link remains active.

Local status updates append audit logs:

```powershell
node src/outbound-link-cli.mjs set-link-status --store .tmp/local-store-merged --link-domain partner.example --status disabled --reason "local fixture test" --out .tmp/local-store-disabled --overwrite
node src/outbound-link-cli.mjs set-instance-status --store .tmp/local-store-merged --instance-id fixture-instance-id --status plain_text --reason "local fixture test" --out .tmp/local-store-instance-disabled --overwrite
```
