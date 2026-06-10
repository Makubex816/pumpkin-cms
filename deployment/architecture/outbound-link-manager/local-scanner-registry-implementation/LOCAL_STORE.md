# Local Store

The local store is a file-backed `.tmp` directory for offline Outbound Link Manager development.

Required files:

- `outbound-links.json`
- `outbound-link-instances.json`
- `outbound-link-policies.json`
- `outbound-link-scan-runs.json`
- `outbound-link-audit-logs.json`
- `outbound-link-store-manifest.json`
- `VALIDATION_RESULT.json`
- `VALIDATION_RESULT.md`

The store is tenant/site scoped. Every link, instance, policy, scan run, and audit log record must carry `tenant_id` and `site_id`.

The store is initialized with:

```powershell
node src/outbound-link-cli.mjs init-store --tenant fixture-tenant --site fixture-site --out .tmp/local-store --overwrite
```

The writer refuses output outside `.tmp` and does not create archives.
