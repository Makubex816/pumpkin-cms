# Export Format

`export-store` writes local compatibility output under `.tmp`.

Tenant bundle compatible files:

```text
tenant-bundle/outbound-links/
  outbound-links.json
  outbound-link-instances.json
  outbound-link-policy.json
  outbound-link-scan-runs.json
```

Backup Center candidate files:

```text
backup-candidate/cms-content/
  outbound-links.json
  outbound-link-instances.json
  outbound-link-policies.json
  outbound-link-scan-runs.json
  outbound-link-audit-summary.json
```

The export also writes `EXPORT_MANIFEST.json`.

No zip, live backup, CMS write, storage mutation, or deployment is created.
