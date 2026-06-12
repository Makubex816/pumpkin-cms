# Resource Registry / Provider Profile Readiness Result

Status: passed.

Carryforward source:

- `deployment/architecture/resource-registry-provider-profiles/v2-5-1-operationalization-hardening-result/result-manifest.json`

V2.8.3 validation:

```text
node src/resource-registry-cli.mjs validate-operational-bindings --fixture fixtures/operational-bindings.v2-5-1.fixture.json --out .tmp/v2-8-3-operational-bindings --overwrite
```

Result:

| Field | Value |
| --- | --- |
| Environment modes | 9 |
| Provider profiles | 9 |
| Resource bindings | 6 |
| Failures | 0 |
| Warnings | 0 |

The generated `.tmp` evidence is ignored and unstaged.

