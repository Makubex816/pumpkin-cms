# Export Result

Implemented `export-store` for local tenant-bundle and Backup Center candidate compatibility.

Proof command:

```powershell
node src/outbound-link-cli.mjs export-store --store .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-policy-blocked --out .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-export --overwrite
```

Result:

- export links: 5
- export instances: 5
- export policies: 2
- export scan runs: 1
- export audit logs: 2
- backup zip created: no

Export files:

- `tenant-bundle/outbound-links/outbound-links.json`
- `tenant-bundle/outbound-links/outbound-link-instances.json`
- `tenant-bundle/outbound-links/outbound-link-policy.json`
- `tenant-bundle/outbound-links/outbound-link-scan-runs.json`
- `backup-candidate/cms-content/outbound-links.json`
- `backup-candidate/cms-content/outbound-link-instances.json`
- `backup-candidate/cms-content/outbound-link-policies.json`
- `backup-candidate/cms-content/outbound-link-scan-runs.json`
- `backup-candidate/cms-content/outbound-link-audit-summary.json`
