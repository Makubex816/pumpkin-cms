# OLM Publish Gate Result

Status: passed for publish-gate input.

Carryforward source:

- `deployment/architecture/outbound-link-manager/v2-2-5-final-stage-ready-signoff-result/result-manifest.json`

V2.8.3 local check:

```text
node src/outbound-link-cli.mjs provider-check --profile fixtures/provider-profile-olm-staging-cosmos-nosql.fixture.json --out .tmp/v2-8-3-provider-profile-check --overwrite
```

Result:

| Field | Value |
| --- | --- |
| Provider profile ID | `olm-staging-cosmos-nosql-v1` |
| Provider mode | `live-write-approved` |
| Live write allowed | `false` |
| Can plan writes | `true` |

No additional OLM staging write occurred.

