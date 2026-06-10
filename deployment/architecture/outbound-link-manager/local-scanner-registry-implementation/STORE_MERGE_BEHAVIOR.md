# Store Merge Behavior

`merge-scan` reads validated scan output and writes a new local store directory.

Merge rules:

- same normalized URL in the same tenant/site remains one `outbound_link`;
- each placement remains one `outbound_link_instance`;
- existing `disabled`, `archived`, and `broken_unverified` link statuses are preserved;
- existing `disabled`, `hidden`, `plain_text`, and `fallback` instance statuses are preserved;
- detected records receive `last_detected_at`, `detection_count`, and `last_scan_run_id`;
- missing prior links become `stale` unless their status is manually preserved;
- missing prior instances become `stale` and `is_enabled: false`;
- scan runs are appended by id;
- a `scan_merged` audit record is appended.

Command:

```powershell
node src/outbound-link-cli.mjs merge-scan --store .tmp/local-store --scan .tmp/tenant-bundle-scan --out .tmp/local-store-merged --overwrite
```
