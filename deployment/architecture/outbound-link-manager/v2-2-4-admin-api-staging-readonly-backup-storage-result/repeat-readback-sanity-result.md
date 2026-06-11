# Repeat Readback Sanity Result

Status: passed.

Command:

```text
node src\outbound-link-cli.mjs azure-cosmos-staging-readback-hardening --package .tmp/phase-2h22-staging-execution-package --profile fixtures/provider-profile-olm-staging-cosmos-nosql.fixture.json --out .tmp/v2-2-4-azure-cosmos-staging-readback-sanity --overwrite
```

Result:

- Provider profile: `olm-staging-cosmos-nosql-v1`
- Provider mode: `live-write-approved` in the approved staging contract, consumed read-only in this pass.
- Write executed: false
- Records written: 0
- Readback records: 48
- Readback status: passed
- Reconciliation status: passed

Evidence:

```text
deployment/architecture/outbound-link-manager/local-scanner-registry-implementation/.tmp/v2-2-4-azure-cosmos-staging-readback-sanity/
```
