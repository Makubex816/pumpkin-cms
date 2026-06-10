# Validator Result

Local store validator proof:

```powershell
node src/outbound-link-cli.mjs validate-store --store .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-policy-blocked
```

Result:

- status: passed
- links: 5
- instances: 5
- policies: 2
- scan runs: 1
- audit logs: 2
- domain-blocked links: 1
- stale instances: 0
- warnings: 0
- failures: 0

Validator coverage includes manifest presence, JSON parsing, tenant/site scope, link references, status enums, blocked-domain effects, merged `last_detected_at`, stale instance disablement, secret-like value detection, and `.tmp` output enforcement.
