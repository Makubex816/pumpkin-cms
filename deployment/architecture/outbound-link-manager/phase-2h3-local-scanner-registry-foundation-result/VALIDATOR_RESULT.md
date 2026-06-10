# Validator Result

Validator command:

```powershell
node src/outbound-link-cli.mjs validate --scan .tmp/phase-2h3-local-scanner-registry-foundation/tenant-bundle-scan
```

Result:

| Check | Result |
| --- | --- |
| Registry JSON parses | passed |
| Instances JSON parses | passed |
| Scan run JSON parses | passed |
| Tenant/site scope present | passed |
| Instance references valid | passed |
| Duplicate normalized URLs collapsed | passed |
| Internal links not classified as outbound | passed |
| Output under `.tmp` | passed |
| Validator status | passed |

Tenant bundle validation summary:

- links: 5
- instances: 5
- stale instances: 0
- failures: 0
