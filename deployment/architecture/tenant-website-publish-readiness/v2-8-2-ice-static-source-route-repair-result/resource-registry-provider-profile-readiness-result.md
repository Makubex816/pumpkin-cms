# Resource Registry / Provider Profile Readiness Result

Command:

```text
node src/resource-registry-cli.mjs validate-operational-bindings --fixture fixtures/operational-bindings.v2-5-1.fixture.json --out .tmp/v2-8-2-operational-bindings --overwrite
```

Result:

| Field | Value |
| --- | --- |
| Status | passed |
| Environment modes | 9 |
| Provider profiles | 9 |
| Resource bindings | 6 |
| Failures | 0 |
| Warnings | 0 |

Provider profile posture:

- `production-runtime` remains blocked.
- `live-write-approved` remains scoped and not globally enabled.
- V2.8.2 did not mutate Resource Registry storage or provider data.
