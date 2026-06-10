# Merge Behavior Result

Proof commands:

```powershell
node src/outbound-link-cli.mjs scan --fixture fixtures/tenant-bundle.fixture.json --out .tmp/phase-2h4-local-data-model-persistence-foundation/tenant-bundle-scan --overwrite
node src/outbound-link-cli.mjs merge-scan --store .tmp/phase-2h4-local-data-model-persistence-foundation/local-store --scan .tmp/phase-2h4-local-data-model-persistence-foundation/tenant-bundle-scan --out .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-merged --overwrite
```

Result:

- scan validation: passed
- scan links: 5
- scan instances: 5
- ignored internal links: 1
- merged store validation: passed
- merged store links: 5
- merged store instances: 5
- scan runs: 1
- audit logs: 1

Merge behavior preserves manually controlled statuses, updates `last_detected_at`, tracks detection counts, and marks missing prior instances stale when configured.
