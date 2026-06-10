# Tenant Bundle Export

`export-tenant-bundle` writes outbound link files for a future tenant website bundle contract.

Command:

```powershell
node src/outbound-link-cli.mjs export-tenant-bundle --store .tmp/local-store-merged --rendered .tmp/render-active --out .tmp/tenant-bundle-export --overwrite
node src/outbound-link-cli.mjs validate-tenant-bundle --bundle .tmp/tenant-bundle-export
```

Required files:

- `outbound-links/outbound-links.json`
- `outbound-links/outbound-link-instances.json`
- `outbound-links/outbound-link-policies.json`
- `outbound-links/outbound-link-scan-runs.json`
- `outbound-links/outbound-link-audit-summary.json`
- `outbound-links/outbound-link-render-decisions.json`
- `outbound-links/EXTERNAL_DOMAIN_REVIEW.md`
- `outbound-links/VALIDATION_RESULT.md`

The export is local/offline and deterministic. It does not publish a tenant website.
