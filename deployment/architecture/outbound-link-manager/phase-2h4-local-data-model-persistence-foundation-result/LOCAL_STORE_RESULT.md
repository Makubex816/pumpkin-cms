# Local Store Result

The local store writes these files:

- `outbound-links.json`
- `outbound-link-instances.json`
- `outbound-link-policies.json`
- `outbound-link-scan-runs.json`
- `outbound-link-audit-logs.json`
- `outbound-link-store-manifest.json`
- `VALIDATION_RESULT.json`
- `VALIDATION_RESULT.md`

Proof command:

```powershell
node src/outbound-link-cli.mjs init-store --tenant fixture-tenant --site fixture-site --policy fixtures/policy-default.fixture.json --out .tmp/phase-2h4-local-data-model-persistence-foundation/local-store --overwrite
```

Result:

- validation: passed
- links: 0
- instances: 0
- output: ignored `.tmp`
